/**
 * Tests — page Inscription (/register)
 * Jest + React Testing Library
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { RegisterForm } from "@/components/auth/register-form";
import * as authApi from "@/lib/api/auth";
import * as usersApi from "@/lib/api/users";
import { AUTH_STORAGE_KEY } from "@/lib/auth/session";

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
jest.mock("@/lib/api/users");

const authSuccessMock = {
  access: "access-token-test",
  refresh: "refresh-token-test",
  is_new_user: true,
  user: {
    id: 1,
    google_id: null,
    phone_number: null,
    first_name: "",
    last_name: "",
    avatar_url: "",
    is_buyer: true,
    is_seller: false,
    is_staff: false,
    roles: ["BUYER"],
  },
};

describe("Page Inscription — RegisterForm", () => {
  beforeEach(() => {
    mockReplace.mockClear();
    window.sessionStorage.clear();
  });

  test("affiche le formulaire profil après validation OTP email", async () => {
    authApi.registerUser.mockResolvedValueOnce({
      ok: true,
      kind: "pending",
      data: {
        detail: "Code OTP envoyé.",
        expires_in_seconds: 300,
        dev_code: "112233",
      },
    });

    authApi.verifyOtpUnified.mockResolvedValueOnce({
      ok: true,
      data: authSuccessMock,
    });

    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.type(screen.getByTestId("register-email-input"), "new@bolingo.km");
    await user.type(screen.getByTestId("register-password-input"), "password123");
    await user.click(screen.getByTestId("register-email-submit"));

    await user.click(screen.getByTestId("otp-submit-button"));

    expect(
      await screen.findByTestId("registration-profile-form"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("register-prenom")).toBeInTheDocument();
    expect(screen.getByTestId("register-nom")).toBeInTheDocument();
    expect(screen.getByTestId("register-ile")).toBeInTheDocument();
    expect(screen.getByTestId("register-ville")).toBeInTheDocument();
  });

  test("refuse la soumission si île ou ville est vide", async () => {
    authApi.registerUser.mockResolvedValueOnce({
      ok: true,
      kind: "pending",
      data: {
        detail: "Code OTP envoyé.",
        expires_in_seconds: 300,
        dev_code: "445566",
      },
    });

    authApi.verifyOtpUnified.mockResolvedValueOnce({
      ok: true,
      data: authSuccessMock,
    });

    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.type(screen.getByTestId("register-email-input"), "new@bolingo.km");
    await user.type(screen.getByTestId("register-password-input"), "password123");
    await user.click(screen.getByTestId("register-email-submit"));
    await user.click(screen.getByTestId("otp-submit-button"));

    await screen.findByTestId("registration-profile-form");

    await user.type(screen.getByTestId("register-prenom"), "Ali");
    await user.type(screen.getByTestId("register-nom"), "Mbae");
    await user.click(screen.getByTestId("register-profile-submit"));

    expect(await screen.findByTestId("register-ile-error")).toHaveTextContent(
      /île/i,
    );
    expect(await screen.findByTestId("register-ville-error")).toHaveTextContent(
      /ville/i,
    );
    expect(usersApi.completeRegistration).not.toHaveBeenCalled();
  });

  test("redirige vers l'accueil et stocke le JWT après inscription réussie", async () => {
    authApi.registerUser.mockResolvedValueOnce({
      ok: true,
      kind: "pending",
      data: {
        detail: "Code OTP envoyé.",
        expires_in_seconds: 300,
        dev_code: "778899",
      },
    });

    authApi.verifyOtpUnified.mockResolvedValueOnce({
      ok: true,
      data: authSuccessMock,
    });

    usersApi.completeRegistration.mockResolvedValueOnce({
      ok: true,
      data: {
        detail: "Inscription finalisée avec succès.",
        profile: {
          ...authSuccessMock.user,
          first_name: "Ali",
          last_name: "Mbae",
        },
      },
    });

    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.type(screen.getByTestId("register-email-input"), "ali@bolingo.km");
    await user.type(screen.getByTestId("register-password-input"), "password123");
    await user.click(screen.getByTestId("register-email-submit"));
    await user.click(screen.getByTestId("otp-submit-button"));

    await screen.findByTestId("registration-profile-form");

    await user.type(screen.getByTestId("register-prenom"), "Ali");
    await user.type(screen.getByTestId("register-nom"), "Mbae");
    await user.selectOptions(screen.getByTestId("register-ile"), "NGAZIDJA");
    await user.type(screen.getByTestId("register-ville"), "Moroni");
    await user.click(screen.getByTestId("register-profile-submit"));

    await waitFor(() => {
      expect(usersApi.completeRegistration).toHaveBeenCalledWith(
        "access-token-test",
        {
          prenom: "Ali",
          nom: "Mbae",
          ile: "NGAZIDJA",
          ville: "Moroni",
        },
      );
    });

    const stored = JSON.parse(window.sessionStorage.getItem(AUTH_STORAGE_KEY));
    expect(stored.access).toBe("access-token-test");
    expect(stored.refresh).toBe("refresh-token-test");

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/dashboard/buyer");
    });
  });
});
