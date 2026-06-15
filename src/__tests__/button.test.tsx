import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { Button } from "@/components/ui/button";
import { renderWithProviders } from "./setup/test-utils";

describe("Button", () => {
  it("defaults to type button", () => {
    renderWithProviders(<Button>Save</Button>);
    expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute("type", "button");
  });

  it("does not call onClick on child when asChild loading", () => {
    const onClick = vi.fn();

    renderWithProviders(
      <Button asChild loading>
        <a href="#go" onClick={onClick}>
          Link
        </a>
      </Button>
    );

    fireEvent.click(screen.getByRole("link", { name: "Link" }));
    expect(onClick).not.toHaveBeenCalled();
  });
});
