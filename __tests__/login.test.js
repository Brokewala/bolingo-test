/**
 * Tests — page Connexion (/login)
 * Jest + React Testing Library
 */

import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { LoginForm } from "@/components/auth/login-form";
import * as authApi from "@/lib/api/auth";

const mockReplace = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn() }),
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children }) => <a href={href}>{children}</a>,
}));

jest.mock("@react-oauth/google", () => ({
  GoogleLogin: () => <div data-testid="google-login-mock">Google Login</div>,
}));

jest.mock("@/lib/api/auth");

describe("Page Connexion — LoginForm", () => {
  beforeEach(() => {
    mockReplace.mockClear();
    jest.useRealTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("valide le format email invalide", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.clear(screen.getByTestId("email-input"));
    await user.type(screen.getByTestId("email-input"), "email-invalide");
    await user.click(screen.getByTestId("email-request-otp"));

    expect(await screen.findByTestId("email-field-error")).toHaveTextContent(
      /format email invalide/i,
    );
    expect(authApi.requestEmailOtp).not.toHaveBeenCalled();
  });

  test("valide le format téléphone invalide", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(screen.getByTestId("auth-tab-phone"));
    await user.clear(screen.getByTestId("phone-input"));
    await user.type(screen.getByTestId("phone-input"), "0690123456");
    await user.click(screen.getByTestId("phone-request-otp"));

    expect(await screen.findByTestId("phone-field-error")).toHaveTextContent(
      /format international/i,
    );
    expect(authApi.sendOtp).not.toHaveBeenCalled();
  });

  test("bascule vers le formulaire OTP après envoi email réussi", async () => {
    authApi.requestEmailOtp.mockResolvedValueOnce({
      ok: true,
      data: {
        detail: "Code OTP envoyé par email.",
        expires_in_seconds: 300,
        account_exists: false,
        dev_code: "123456",
      },
    });

    const user = userEvent.setup();
    render(<LoginForm />);

    await user.clear(screen.getByTestId("email-input"));
    await user.type(screen.getByTestId("email-input"), "test@bolingo.km");
    await user.click(screen.getByTestId("email-request-otp"));

    expect(await screen.findByTestId("otp-verify-form")).toBeInTheDocument();
    expect(screen.getByTestId("otp-code-input")).toHaveValue("123456");
    expect(authApi.requestEmailOtp).toHaveBeenCalledWith("test@bolingo.km");
  });

  test("désactive le bouton renvoi pendant 60 secondes", async () => {
    const start = new Date("2026-01-01T12:00:00Z");
    jest.useFakeTimers({ now: start, advanceTimers: true });

    authApi.requestEmailOtp.mockResolvedValue({
      ok: true,
      data: {
        detail: "Code OTP envoyé.",
        expires_in_seconds: 300,
        account_exists: true,
      },
    });

    const user = userEvent.setup({
      advanceTimers: jest.advanceTimersByTime,
    });
    render(<LoginForm />);

    await user.type(screen.getByTestId("email-input"), "user@bolingo.km");
    await user.click(screen.getByTestId("email-request-otp"));

    const resendButton = await screen.findByTestId("otp-resend-button");
    expect(resendButton).toBeDisabled();

    await act(async () => {
      jest.advanceTimersByTime(30_000);
    });

    expect(resendButton).toBeDisabled();
    expect(screen.getByTestId("otp-resend-seconds")).toHaveTextContent("30");

    await act(async () => {
      jest.advanceTimersByTime(31_000);
    });

    await waitFor(() => {
      expect(resendButton).not.toBeDisabled();
    });
  });

  test("affiche un message d'erreur API mappé (code expiré)", async () => {
    authApi.requestEmailOtp.mockResolvedValueOnce({
      ok: true,
      data: {
        detail: "Code envoyé",
        expires_in_seconds: 300,
        account_exists: true,
        dev_code: "654321",
      },
    });

    authApi.verifyEmailOtp.mockResolvedValueOnce({
      ok: false,
      status: 400,
      error: "Code expiré. Demandez un nouveau code.",
    });

    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByTestId("email-input"), "user@bolingo.km");
    await user.click(screen.getByTestId("email-request-otp"));

    await waitFor(() => {
      expect(screen.getByTestId("otp-code-input")).toHaveValue("654321");
    });
    await user.click(screen.getByTestId("otp-submit-button"));

    expect(await screen.findByTestId("auth-error")).toHaveTextContent(
      /code expiré/i,
    );
  });
});
