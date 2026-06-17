import { type Category } from '../api/categories.js';

export interface NestedCategory extends Category {
  depth: number;
  children: NestedCategory[];
}

export const buildCategoryTree = (categories: Category[]): NestedCategory[] => {
  const map = new Map<number, NestedCategory>();
  const roots: NestedCategory[] = [];

  // First pass: create nodes
  categories.forEach(c => {
    map.set(c.id, { ...c, depth: 0, children: [] });
  });

  // Second pass: wire children and parents
  categories.forEach(c => {
    const node = map.get(c.id)!;
    if (c.parent_id !== null && c.parent_id !== undefined) {
      const parent = map.get(c.parent_id);
      if (parent) {
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    } else {
      roots.push(node);
    }
  });

  // Calculate depths recursively
  const setDepth = (node: NestedCategory, depth: number) => {
    node.depth = depth;
    node.children.forEach(child => setDepth(child, depth + 1));
  };
  roots.forEach(root => setDepth(root, 0));

  return roots;
};

// Flatten tree for list views (like select dropdowns)
export const flattenCategoryTree = (tree: NestedCategory[]): NestedCategory[] => {
  const result: NestedCategory[] = [];
  const traverse = (node: NestedCategory) => {
    result.push(node);
    node.children.forEach(traverse);
  };
  tree.forEach(traverse);
  return result;
};

// Check if a category is a descendant of another
export const isDescendantOf = (childId: number, potentialParentId: number, categories: Category[]): boolean => {
  let current = categories.find(c => c.id === childId);
  while (current && current.parent_id !== null) {
    if (current.parent_id === potentialParentId) {
      return true;
    }
    current = categories.find(c => c.id === current!.parent_id);
  }
  return false;
};
