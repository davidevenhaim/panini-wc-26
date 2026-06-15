import { z } from "zod";
import { formValidator } from "@/components/form/utils/form-validator";

export const loginSchema = z.object({
  email: formValidator.requiredEmail(),
  password: formValidator.requiredPasswordRelaxed(),
});

export const signupSchema = z
  .object({
    email: formValidator.requiredEmail(),
    password: formValidator.requiredPasswordRelaxed(),
    confirmPassword: formValidator.requiredPasswordRelaxed(),
  })
  .refine(formValidator.confirmPassword("password", "confirmPassword"), {
    path: ["confirmPassword"],
    error: "passwordsDoNotMatch",
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignupFormValues = z.infer<typeof signupSchema>;
