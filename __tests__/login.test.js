/**
 * Tests — page Connexion (/login)
 * Jest + React Testing Library
 */

import { render, screen } from "@testing-library/react";
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
  useGoogleOAuth: () => ({
    clientId: "test-client-id",
    scriptLoadedSuccessfully: true,
  }),
}));

jest.mock("@/lib/api/auth");

describe("Page Connexion — LoginForm", () => {
  beforeEach(() => {
    mockReplace.mockClear();
  });

  test("valide le format email invalide", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.clear(screen.getByTestId("email-input"));
    await user.type(screen.getByTestId("email-input"), "email-invalide");
    await user.type(screen.getByTestId("password-input"), "password123");
    await user.click(screen.getByTestId("email-login-submit"));

    expect(await screen.findByTestId("email-field-error")).toHaveTextContent(
      /format email invalide/i,
    );
    expect(authApi.loginWithPassword).not.toHaveBeenCalled();
  });

  test("valide le format téléphone invalide", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(screen.getByTestId("auth-tab-phone"));
    await user.clear(screen.getByTestId("phone-input"));
    await user.type(screen.getByTestId("phone-input"), "0690123456");
    await user.type(screen.getByTestId("password-input"), "password123");
    await user.click(screen.getByTestId("phone-login-submit"));

    expect(await screen.findByTestId("phone-field-error")).toHaveTextContent(
      /format international/i,
    );
    expect(authApi.loginWithPassword).not.toHaveBeenCalled();
  });

  test("connecte avec email et mot de passe", async () => {
    authApi.loginWithPassword.mockResolvedValueOnce({
      ok: true,
      data: {
        access: "access-token",
        refresh: "refresh-token",
        is_new_user: false,
        user: { id: 1, roles: ["BUYER"] },
      },
    });

    const user = userEvent.setup();
    render(<LoginForm />);

    await user.clear(screen.getByTestId("email-input"));
    await user.type(screen.getByTestId("email-input"), "test@bolingo.km");
    await user.type(screen.getByTestId("password-input"), "password123");
    await user.click(screen.getByTestId("email-login-submit"));

    expect(authApi.loginWithPassword).toHaveBeenCalledWith({
      email: "test@bolingo.km",
      password: "password123",
    });
    expect(mockReplace).toHaveBeenCalledWith("/");
  });

  test("affiche un message d'erreur API mappé (compte non activé)", async () => {
    authApi.loginWithPassword.mockResolvedValueOnce({
      ok: false,
      status: 403,
      error: "Compte non activé. Validez l'OTP reçu lors de l'inscription.",
    });

    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByTestId("email-input"), "user@bolingo.km");
    await user.type(screen.getByTestId("password-input"), "password123");
    await user.click(screen.getByTestId("email-login-submit"));

    expect(await screen.findByTestId("auth-error")).toHaveTextContent(
      /non activé/i,
    );
  });
});
