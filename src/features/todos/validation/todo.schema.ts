import { z } from "zod";
import { formValidator } from "@/components/form/utils/form-validator";

export const todoSchema = z.object({
  text: formValidator.requiredString(),
});

export type TodoFormValues = z.infer<typeof todoSchema>;
