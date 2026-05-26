package com.cofound;

import com.cofound.algorithm.KMPMatcher;
import com.cofound.algorithm.RedBlackTree;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class AlgorithmTests {

    // --- KMP Substring Matching Tests ---

    @Test
    public void testKMPPrefixFunction() {
        String pattern = "ABABCABAB";
        int[] expectedPi = {0, 0, 1, 2, 0, 1, 2, 3, 4};
        int[] actualPi = KMPMatcher.computePrefixFunction(pattern);
        assertArrayEquals(expectedPi, actualPi);
    }

    @Test
    public void testKMPSearchFound() {
        String text = "AABAACAADAABAAABAA";
        String pattern = "AABA";
        List<Integer> expectedIndices = Arrays.asList(0, 9, 13);
        List<Integer> actualIndices = KMPMatcher.search(text, pattern);
        assertEquals(expectedIndices, actualIndices);
    }

    @Test
    public void testKMPSearchNotFound() {
        String text = "AABAACAADAABAAABAA";
        String pattern = "XYZ";
        List<Integer> actualIndices = KMPMatcher.search(text, pattern);
        assertTrue(actualIndices.isEmpty());
    }

    @Test
    public void testKMPContainsCaseInsensitive() {
        String text = "Founder looking for dynamic React Developer";
        String query = "react";
        assertTrue(KMPMatcher.contains(text, query, true));
        assertFalse(KMPMatcher.contains(text, query, false));
    }

    // --- Red-Black Tree Tests ---

    @Test
    public void testRBTreeInsertionAndSearch() {
        RedBlackTree<String> tree = new RedBlackTree<>();
        tree.insert(5, "Project A");
        tree.insert(3, "Project B");
        tree.insert(7, "Project C");
        tree.insert(3, "Project B-v2"); // Duplicate key

        // Verify root is black
        assertNotNull(tree.getRoot());
        assertEquals(RedBlackTree.BLACK, tree.getRoot().color);

        // Search for existing key
        RedBlackTree.Node<String> node3 = tree.search(3);
        assertNotNull(node3);
        assertEquals(2, node3.values.size());
        assertTrue(node3.values.contains("Project B"));
        assertTrue(node3.values.contains("Project B-v2"));

        // Search for non-existing key
        assertNull(tree.search(99));
    }

    @Test
    public void testRBTreeRangeSearch() {
        RedBlackTree<String> tree = new RedBlackTree<>();
        tree.insert(1, "Proj 1");
        tree.insert(3, "Proj 3");
        tree.insert(5, "Proj 5");
        tree.insert(7, "Proj 7");
        tree.insert(10, "Proj 10");

        // Range query [2, 7] -> should return Proj 3, Proj 5, Proj 7
        List<String> rangeResults = tree.getRange(2, 7);
        assertEquals(3, rangeResults.size());
        assertTrue(rangeResults.contains("Proj 3"));
        assertTrue(rangeResults.contains("Proj 5"));
        assertTrue(rangeResults.contains("Proj 7"));
        assertFalse(rangeResults.contains("Proj 1"));
        assertFalse(rangeResults.contains("Proj 10"));
    }
}
