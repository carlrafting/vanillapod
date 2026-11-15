import { assertEquals } from "@std/assert";
// dom/license is a relative symlink; it broke once when its target moved.
import linked from "../license" with { type: "text" };
import root from "../../license" with { type: "text" };

Deno.test("dom/license resolves to the repository license", () => {
  assertEquals(linked, root);
});
