import { render, screen } from "@testing-library/react";
import { GlassPanel } from "../GlassPanel";

describe("GlassPanel", () => {
  it("renders children correctly", () => {
    render(
      <GlassPanel>
        <p>Test content</p>
      </GlassPanel>
    );
    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("applies glass-surface class", () => {
    const { container } = render(<GlassPanel>Content</GlassPanel>);
    const panel = container.firstChild as HTMLElement;
    expect(panel).toHaveClass("glass-surface");
  });

  it("merges custom className", () => {
    const { container } = render(
      <GlassPanel className="custom-class">Content</GlassPanel>
    );
    const panel = container.firstChild as HTMLElement;
    expect(panel).toHaveClass("glass-surface", "custom-class");
  });

  it("forwards ref correctly", () => {
    const ref = { current: null };
    render(<GlassPanel ref={ref}>Content</GlassPanel>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("renders reflection overlay with aria-hidden", () => {
    const { container } = render(<GlassPanel>Content</GlassPanel>);
    const reflection = container.querySelector('[aria-hidden="true"]');
    expect(reflection).toBeInTheDocument();
    expect(reflection).toHaveClass("glass-reflection");
  });

  it("passes through HTML attributes", () => {
    render(
      <GlassPanel data-testid="panel" role="region">
        Content
      </GlassPanel>
    );
    const panel = screen.getByTestId("panel");
    expect(panel).toHaveAttribute("role", "region");
  });
});
