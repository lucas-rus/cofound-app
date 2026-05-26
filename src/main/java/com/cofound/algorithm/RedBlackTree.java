package com.cofound.algorithm;

import java.util.ArrayList;
import java.util.List;

/**
 * Custom implementation of a Red-Black Tree (self-balancing binary search tree).
 * Implemented for the Advanced Data Structures project requirements.
 * Keys are integers (e.g. teamSizeNeeded), and multiple values can be stored at the same key.
 */
public class RedBlackTree<V> {

    public static final boolean RED = true;
    public static final boolean BLACK = false;

    public static class Node<V> {
        public int key;
        public List<V> values;
        public Node<V> left, right, parent;
        public boolean color; // true = RED, false = BLACK

        public Node(int key, V value) {
            this.key = key;
            this.values = new ArrayList<>();
            if (value != null) {
                this.values.add(value);
            }
            this.color = RED; // New nodes are inserted as RED
        }

        @Override
        public String toString() {
            return "Node{" + "key=" + key + ", color=" + (color ? "RED" : "BLACK") + ", valCount=" + values.size() + '}';
        }
    }

    private Node<V> root;
    private Node<V> nil; // Sentinel node representing null leaves

    public RedBlackTree() {
        nil = new Node<>(-1, null);
        nil.color = BLACK;
        nil.left = nil.right = nil.parent = nil;
        root = nil;
    }

    public Node<V> getRoot() {
        return root;
    }

    public Node<V> getNil() {
        return nil;
    }

    /**
     * Searches for a node with the given key.
     */
    public Node<V> search(int key) {
        Node<V> current = root;
        while (current != nil && key != current.key) {
            if (key < current.key) {
                current = current.left;
            } else {
                current = current.right;
            }
        }
        return current == nil ? null : current;
    }

    /**
     * Inserts a key and its associated value into the tree.
     */
    public void insert(int key, V value) {
        // If the key already exists, just add the value to the list
        Node<V> existing = search(key);
        if (existing != null) {
            existing.values.add(value);
            return;
        }

        Node<V> z = new Node<>(key, value);
        z.left = nil;
        z.right = nil;

        Node<V> y = nil;
        Node<V> x = root;

        while (x != nil) {
            y = x;
            if (z.key < x.key) {
                x = x.left;
            } else {
                x = x.right;
            }
        }

        z.parent = y;
        if (y == nil) {
            root = z;
        } else if (z.key < y.key) {
            y.left = z;
        } else {
            y.right = z;
        }

        insertFixup(z);
    }

    /**
     * Performs Left Rotation.
     */
    private void leftRotate(Node<V> x) {
        Node<V> y = x.right;
        x.right = y.left;

        if (y.left != nil) {
            y.left.parent = x;
        }

        y.parent = x.parent;

        if (x.parent == nil) {
            root = y;
        } else if (x == x.parent.left) {
            x.parent.left = y;
        } else {
            x.parent.right = y;
        }

        y.left = x;
        x.parent = y;
    }

    /**
     * Performs Right Rotation.
     */
    private void rightRotate(Node<V> y) {
        Node<V> x = y.left;
        y.left = x.right;

        if (x.right != nil) {
            x.right.parent = y;
        }

        x.parent = y.parent;

        if (y.parent == nil) {
            root = x;
        } else if (y == y.parent.right) {
            y.parent.right = x;
        } else {
            y.parent.left = x;
        }

        x.right = y;
        y.parent = x;
    }

    /**
     * Fixes violations of the Red-Black Tree properties after insertion.
     */
    private void insertFixup(Node<V> z) {
        while (z.parent.color == RED) {
            if (z.parent == z.parent.parent.left) {
                Node<V> y = z.parent.parent.right; // Uncle node
                if (y.color == RED) {
                    // Case 1: Uncle is RED -> Recolor parent, uncle, grandparent
                    z.parent.color = BLACK;
                    y.color = BLACK;
                    z.parent.parent.color = RED;
                    z = z.parent.parent;
                } else {
                    // Case 2 & 3: Uncle is BLACK
                    if (z == z.parent.right) {
                        // Case 2: z is right child -> left rotate
                        z = z.parent;
                        leftRotate(z);
                    }
                    // Case 3: z is left child -> right rotate & recolor
                    z.parent.color = BLACK;
                    z.parent.parent.color = RED;
                    rightRotate(z.parent.parent);
                }
            } else {
                Node<V> y = z.parent.parent.left; // Uncle node
                if (y.color == RED) {
                    // Case 1: Uncle is RED
                    z.parent.color = BLACK;
                    y.color = BLACK;
                    z.parent.parent.color = RED;
                    z = z.parent.parent;
                } else {
                    // Case 2 & 3: Uncle is BLACK
                    if (z == z.parent.left) {
                        z = z.parent;
                        rightRotate(z);
                    }
                    z.parent.color = BLACK;
                    z.parent.parent.color = RED;
                    leftRotate(z.parent.parent);
                }
            }
        }
        root.color = BLACK;
    }

    /**
     * Performs a range search: finds all values in the tree with keys between min and max (inclusive).
     */
    public List<V> getRange(int min, int max) {
        List<V> result = new ArrayList<>();
        inorderRange(root, min, max, result);
        return result;
    }

    private void inorderRange(Node<V> node, int min, int max, List<V> result) {
        if (node == nil || node == null) {
            return;
        }

        // Search left subtree if there can be keys >= min
        if (node.key > min) {
            inorderRange(node.left, min, max, result);
        }

        // Add node values if key falls in range
        if (node.key >= min && node.key <= max) {
            result.addAll(node.values);
        }

        // Search right subtree if there can be keys <= max
        if (node.key < max) {
            inorderRange(node.right, min, max, result);
        }
    }

    /**
     * Clears all nodes from the tree.
     */
    public void clear() {
        root = nil;
    }
}
