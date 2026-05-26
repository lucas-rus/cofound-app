package com.cofound.algorithm;

import java.util.ArrayList;
import java.util.List;

/**
 * Custom implementation of the Knuth-Morris-Pratt (KMP) String Matching Algorithm.
 * Implemented for the Advanced Data Structures project requirements.
 */
public class KMPMatcher {

    /**
     * Computes the prefix function (pi table) for the given pattern.
     * pi[i] stores the length of the longest proper prefix of pattern[0..i]
     * which is also a suffix of pattern[0..i].
     */
    public static int[] computePrefixFunction(String pattern) {
        if (pattern == null || pattern.isEmpty()) {
            return new int[0];
        }
        int m = pattern.length();
        int[] pi = new int[m];
        pi[0] = 0;
        int k = 0;

        for (int i = 1; i < m; i++) {
            while (k > 0 && pattern.charAt(k) != pattern.charAt(i)) {
                k = pi[k - 1];
            }
            if (pattern.charAt(k) == pattern.charAt(i)) {
                k++;
            }
            pi[i] = k;
        }
        return pi;
    }

    /**
     * Searches for occurrences of the pattern in the given text using KMP.
     * Returns a list of starting indices (0-indexed) where the pattern is found in the text.
     */
    public static List<Integer> search(String text, String pattern) {
        List<Integer> matches = new ArrayList<>();
        if (text == null || pattern == null || text.isEmpty() || pattern.isEmpty()) {
            return matches;
        }

        int n = text.length();
        int m = pattern.length();
        
        if (m > n) {
            return matches; // Pattern longer than text cannot match
        }

        int[] pi = computePrefixFunction(pattern);
        int q = 0; // Number of characters matched

        for (int i = 0; i < n; i++) {
            while (q > 0 && pattern.charAt(q) != text.charAt(i)) {
                q = pi[q - 1]; // Look back in the prefix function
            }
            if (pattern.charAt(q) == text.charAt(i)) {
                q++; // Match next character
            }
            if (q == m) { // Found a match
                matches.add(i - m + 1);
                q = pi[q - 1]; // Look for next match
            }
        }

        return matches;
    }

    /**
     * Checks if the pattern exists inside the text (case-insensitive option).
     */
    public static boolean contains(String text, String pattern, boolean caseInsensitive) {
        if (text == null || pattern == null) {
            return false;
        }
        if (caseInsensitive) {
            return !search(text.toLowerCase(), pattern.toLowerCase()).isEmpty();
        }
        return !search(text, pattern).isEmpty();
    }
}
