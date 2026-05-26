import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Form, Button, Tabs, Tab, Table, Badge, Alert } from 'react-bootstrap';
import { FiPlay, FiSkipForward, FiRotateCcw, FiPlus, FiSearch, FiHelpCircle } from 'react-icons/fi';

// ==========================================
// 1. JAVASCRIPT RED-BLACK TREE IMPLEMENTATION
// ==========================================

const RED = true;
const BLACK = false;

class RBNode {
  constructor(key, value, id) {
    this.key = key;
    this.value = value;
    this.values = value === "NIL" ? [] : [value];
    this.id = id; // Unique ID for React rendering keys
    this.left = null;
    this.right = null;
    this.parent = null;
    this.color = RED;
  }
}

class JSRedBlackTree {
  constructor() {
    this.nil = new RBNode(-1, "NIL", "NIL");
    this.nil.color = BLACK;
    this.nil.left = this.nil.right = this.nil.parent = this.nil;
    this.root = this.nil;
    this.nodeCount = 0;
  }

  search(key) {
    let current = this.root;
    while (current !== this.nil && key !== current.key) {
      if (key < current.key) {
        current = current.left;
      } else {
        current = current.right;
      }
    }
    return current === this.nil ? null : current;
  }

  insert(key, value) {
    const existing = this.search(key);
    if (existing) {
      existing.values.push(value);
      return [`Key ${key} already exists. Added "${value}" to the node's project list.`];
    }

    this.nodeCount++;
    const z = new RBNode(key, value, `node-${this.nodeCount}`);
    z.left = this.nil;
    z.right = this.nil;

    let y = this.nil;
    let x = this.root;

    while (x !== this.nil) {
      y = x;
      if (z.key < x.key) {
        x = x.left;
      } else {
        x = x.right;
      }
    }

    z.parent = y;
    if (y === this.nil) {
      this.root = z;
    } else if (z.key < y.key) {
      y.left = z;
    } else {
      y.right = z;
    }

    const logs = [];
    logs.push(`Inserted node ${key} ("${value}") as RED.`);
    this.insertFixup(z, logs);
    return logs;
  }

  leftRotate(x, logs) {
    const y = x.right;
    x.right = y.left;

    if (y.left !== this.nil) {
      y.left.parent = x;
    }

    y.parent = x.parent;

    if (x.parent === this.nil) {
      this.root = y;
    } else if (x === x.parent.left) {
      x.parent.left = y;
    } else {
      x.parent.right = y;
    }

    y.left = x;
    x.parent = y;
    logs.push(`Left rotated around node ${x.key}.`);
  }

  rightRotate(y, logs) {
    const x = y.left;
    y.left = x.right;

    if (x.right !== this.nil) {
      x.right.parent = y;
    }

    x.parent = y.parent;

    if (y.parent === this.nil) {
      this.root = x;
    } else if (y === y.parent.right) {
      y.parent.right = x;
    } else {
      y.parent.left = x;
    }

    x.right = y;
    y.parent = x;
    logs.push(`Right rotated around node ${y.key}.`);
  }

  insertFixup(z, logs) {
    while (z.parent.color === RED) {
      if (z.parent === z.parent.parent.left) {
        const y = z.parent.parent.right; // Uncle
        if (y.color === RED) {
          // Case 1: Recolor
          z.parent.color = BLACK;
          y.color = BLACK;
          z.parent.parent.color = RED;
          logs.push(`Uncle ${y.key} is RED (Case 1). Recolored parent ${z.parent.key} and uncle ${y.key} to BLACK, grandparent ${z.parent.parent.key} to RED.`);
          z = z.parent.parent;
        } else {
          // Case 2 & 3: Uncle is BLACK
          if (z === z.parent.right) {
            // Case 2
            z = z.parent;
            this.leftRotate(z, logs);
            logs.push(`Uncle is BLACK, node is right child (Case 2). Left rotated.`);
          }
          // Case 3
          z.parent.color = BLACK;
          z.parent.parent.color = RED;
          logs.push(`Uncle is BLACK (Case 3). Recolored parent ${z.parent.key} to BLACK, grandparent ${z.parent.parent.key} to RED.`);
          this.rightRotate(z.parent.parent, logs);
        }
      } else {
        const y = z.parent.parent.left; // Uncle
        if (y.color === RED) {
          z.parent.color = BLACK;
          y.color = BLACK;
          z.parent.parent.color = RED;
          logs.push(`Uncle ${y.key} is RED (Case 1). Recolored parent ${z.parent.key} and uncle ${y.key} to BLACK, grandparent ${z.parent.parent.key} to RED.`);
          z = z.parent.parent;
        } else {
          if (z === z.parent.left) {
            z = z.parent;
            this.rightRotate(z, logs);
            logs.push(`Uncle is BLACK, node is left child (Case 2). Right rotated.`);
          }
          z.parent.color = BLACK;
          z.parent.parent.color = RED;
          logs.push(`Uncle is BLACK (Case 3). Recolored parent ${z.parent.key} to BLACK, grandparent ${z.parent.parent.key} to RED.`);
          this.leftRotate(z.parent.parent, logs);
        }
      }
    }
    if (this.root.color !== BLACK) {
      this.root.color = BLACK;
      logs.push("Recolored root node to BLACK.");
    }
  }
}

// ==========================================
// 2. MAIN VISUALIZATION REACT COMPONENT
// ==========================================

const DataStructuresVisualizer = () => {
  // Tabs state
  const [activeTab, setActiveTab] = useState('rbtree');

  // --- Red-Black Tree States ---
  const [treeInstance] = useState(new JSRedBlackTree());
  const [treeVersion, setTreeVersion] = useState(0); // Trigger re-render
  const [rbKey, setRbKey] = useState('');
  const [rbVal, setRbVal] = useState('');
  const [treeLogs, setTreeLogs] = useState(["Tree initialized. Ready to index startup projects."]);
  const [rangeMin, setRangeMin] = useState(1);
  const [rangeMax, setRangeMax] = useState(5);
  const [rangeResults, setRangeResults] = useState([]);

  // --- KMP Simulator States ---
  const [kmpText, setKmpText] = useState('build cofound React app with Spring Boot backend');
  const [kmpPattern, setKmpPattern] = useState('React');
  const [kmpPi, setKmpPi] = useState([]);
  const [kmpSteps, setKmpSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1000); // ms
  const playTimer = useRef(null);

  // Initialize RB Tree with mock startup data to make it look full and ready
  useEffect(() => {
    if (treeInstance.root === treeInstance.nil) {
      treeInstance.insert(4, "AI Agent Builder");
      treeInstance.insert(2, "SaaS Platform");
      treeInstance.insert(6, "B2B Marketplace");
      treeInstance.insert(1, "Crypto Wallet");
      treeInstance.insert(3, "EdTech Portal");
      treeInstance.insert(5, "Health Tracker");
      treeInstance.insert(7, "Green Energy IoT");
      setTreeVersion(v => v + 1);
      setTreeLogs(prev => [
        ...prev,
        "Pre-populated tree with mock projects keyed by required 'Team SizeNeeded' (1, 2, 3, 4, 5, 6, 7)."
      ]);
    }
  }, [treeInstance]);

  // Handle tree insert
  const handleTreeInsert = (e) => {
    e.preventDefault();
    const key = parseInt(rbKey);
    if (isNaN(key) || !rbVal.trim()) return;

    const logs = treeInstance.insert(key, rbVal);
    setRbKey('');
    setRbVal('');
    setTreeLogs(prev => [...prev, ...logs]);
    setTreeVersion(v => v + 1);
  };

  // Handle tree range search
  const handleRangeSearch = () => {
    const results = [];
    const collectRange = (node) => {
      if (node === treeInstance.nil) return;
      if (node.key > rangeMin) collectRange(node.left);
      if (node.key >= rangeMin && node.key <= rangeMax) {
        results.push({ key: node.key, value: node.value });
      }
      if (node.key < rangeMax) collectRange(node.right);
    };
    collectRange(treeInstance.root);
    setRangeResults(results);
    setTreeLogs(prev => [
      ...prev,
      `Performed index range scan: teamSize in [${rangeMin}, ${rangeMax}]. Found ${results.length} projects.`
    ]);
  };

  // Clear Tree
  const handleClearTree = () => {
    treeInstance.root = treeInstance.nil;
    setTreeVersion(v => v + 1);
    setRangeResults([]);
    setTreeLogs(["Tree cleared."]);
  };

  // --- KMP Core Simulator Logic ---
  const calculateKmpPi = (pat) => {
    const m = pat.length;
    const pi = new Array(m).fill(0);
    let k = 0;
    for (let i = 1; i < m; i++) {
      while (k > 0 && pat[k] !== pat[i]) {
        k = pi[k - 1];
      }
      if (pat[k] === pat[i]) {
        k++;
      }
      pi[i] = k;
    }
    return pi;
  };

  const generateKmpSteps = (txt, pat) => {
    const steps = [];
    const pi = calculateKmpPi(pat);
    const n = txt.length;
    const m = pat.length;

    let q = 0; // Number of characters matched

    // Record initial step
    steps.push({
      i: 0,
      q: 0,
      textChar: txt[0],
      patChar: pat[0],
      status: 'comparing',
      description: 'Start scanning from first text character.',
      matches: []
    });

    const matchesFound = [];

    for (let i = 0; i < n; i++) {
      // Record comparing character state
      steps.push({
        i,
        q,
        textChar: txt[i],
        patChar: pat[q],
        status: 'comparing',
        description: `Comparing Text[${i}] = '${txt[i]}' with Pattern[${q}] = '${pat[q]}'.`,
        matches: [...matchesFound]
      });

      while (q > 0 && pat[q] !== txt[i]) {
        q = pi[q - 1];
        steps.push({
          i,
          q,
          textChar: txt[i],
          patChar: pat[q],
          status: 'backtracking',
          description: `Mismatch! Backtracking using prefix function table: q shifted to ${q}.`,
          matches: [...matchesFound]
        });
      }

      if (pat[q] === txt[i]) {
        q++;
        steps.push({
          i,
          q,
          textChar: txt[i],
          patChar: pat[q - 1],
          status: 'matched_char',
          description: `Character match! Incrementing pattern match counter q to ${q}.`,
          matches: [...matchesFound]
        });
      }

      if (q === m) {
        matchesFound.push(i - m + 1);
        q = pi[q - 1];
        steps.push({
          i,
          q,
          textChar: txt[i],
          patChar: null,
          status: 'found_match',
          description: `FULL PATTERN MATCH FOUND at index ${i - m + 1}! Resetting q to ${q} using prefix table.`,
          matches: [...matchesFound]
        });
      }
    }

    return { steps, pi };
  };

  // Run/reset KMP
  const handleKmpSubmit = (e) => {
    if (e) e.preventDefault();
    if (!kmpText || !kmpPattern) return;
    const { steps, pi } = generateKmpSteps(kmpText, kmpPattern);
    setKmpPi(pi);
    setKmpSteps(steps);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  // KMP trigger calculation on mount
  useEffect(() => {
    handleKmpSubmit();
  }, []);

  // Animation Play loop
  useEffect(() => {
    if (isPlaying) {
      playTimer.current = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= kmpSteps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, playSpeed);
    } else {
      clearInterval(playTimer.current);
    }
    return () => clearInterval(playTimer.current);
  }, [isPlaying, kmpSteps, playSpeed]);

  // --- SVG Tree Drawing Logic ---
  const nodeRadius = 22;
  const levelHeight = 65;

  const drawTree = (node, x, y, dx, svgElements) => {
    if (node === treeInstance.nil || node === null) {
      return;
    }

    // Draw left child link
    if (node.left !== treeInstance.nil) {
      const lx = x - dx;
      const ly = y + levelHeight;
      svgElements.push(
        <line
          key={`line-l-${node.key}-${node.left.key}`}
          x1={x}
          y1={y}
          x2={lx}
          y2={ly}
          stroke="#adb5bd"
          strokeWidth="2.5"
        />
      );
      drawTree(node.left, lx, ly, dx * 0.45, svgElements);
    } else {
      // Option: Draw a small black leaf node representation (standard RBTree NIL node)
      const lx = x - dx / 2;
      const ly = y + levelHeight * 0.7;
      svgElements.push(
        <g key={`nil-l-${node.key}`}>
          <line x1={x} y1={y} x2={lx} y2={ly} stroke="#dee2e6" strokeWidth="1.5" strokeDasharray="3,3" />
          <rect x={lx - 6} y={ly - 6} width={12} height={12} fill="#212529" rx={2} stroke="#adb5bd" />
        </g>
      );
    }

    // Draw right child link
    if (node.right !== treeInstance.nil) {
      const rx = x + dx;
      const ry = y + levelHeight;
      svgElements.push(
        <line
          key={`line-r-${node.key}-${node.right.key}`}
          x1={x}
          y1={y}
          x2={rx}
          y2={ry}
          stroke="#adb5bd"
          strokeWidth="2.5"
        />
      );
      drawTree(node.right, rx, ry, dx * 0.45, svgElements);
    } else {
      // Draw small black leaf node representation
      const rx = x + dx / 2;
      const ry = y + levelHeight * 0.7;
      svgElements.push(
        <g key={`nil-r-${node.key}`}>
          <line x1={x} y1={y} x2={rx} y2={ry} stroke="#dee2e6" strokeWidth="1.5" strokeDasharray="3,3" />
          <rect x={rx - 6} y={ry - 6} width={12} height={12} fill="#212529" rx={2} stroke="#adb5bd" />
        </g>
      );
    }

    // Draw current node
    const nodeColor = node.color === RED ? '#e63946' : '#1d3557';
    svgElements.push(
      <g key={node.id} className="tree-node-group" style={{ cursor: 'pointer' }}>
        <circle
          cx={x}
          cy={y}
          r={nodeRadius}
          fill={nodeColor}
          stroke="#ffffff"
          strokeWidth="2"
          style={{ filter: 'drop-shadow(0px 3px 5px rgba(0,0,0,0.15))' }}
        />
        <text
          x={x}
          y={y + 5}
          textAnchor="middle"
          fill="#ffffff"
          fontWeight="bold"
          fontSize="13px"
        >
          {node.key}
        </text>
        <title>{`Team Size Needed: ${node.key}\nProjects:\n- ${node.values.join('\n- ')}`}</title>
      </g>
    );
  };

  const svgElements = [];
  if (treeInstance.root !== treeInstance.nil) {
    drawTree(treeInstance.root, 400, 40, 180, svgElements);
  }

  // Helper for rendering highlighted text in KMP
  const renderKmpText = () => {
    if (currentStep === -1 || kmpSteps.length === 0) return kmpText;
    const step = kmpSteps[currentStep];
    const { i, q, status } = step;

    // We highlight matched prefix, currently compared, and normal text
    const chars = [];
    const textLength = kmpText.length;

    for (let idx = 0; idx < textLength; idx++) {
      let className = "text-char";
      let style = {};

      if (idx === i) {
        if (status === 'comparing') {
          style = { backgroundColor: '#ffe3e0', border: '1px solid #e63946', fontWeight: 'bold' };
        } else if (status === 'matched_char') {
          style = { backgroundColor: '#d4edda', border: '1px solid #28a745', fontWeight: 'bold' };
        } else if (status === 'backtracking') {
          style = { backgroundColor: '#fff3cd', border: '1px solid #ffc107', fontWeight: 'bold' };
        }
      } else if (idx >= i - q && idx < i) {
        style = { backgroundColor: '#e2f0fe', color: '#0066cc' }; // Current partial match window
      } else if (step.status === 'found_match' && idx > i - kmpPattern.length && idx <= i) {
        style = { backgroundColor: '#28a745', color: '#ffffff', fontWeight: 'bold' }; // Full match index
      }

      chars.push(
        <span key={idx} className="px-1 font-monospace fs-5 rounded" style={{ ...style, display: 'inline-block', minWidth: '1.2rem', textAlign: 'center' }}>
          {kmpText[idx] === ' ' ? '\u00A0' : kmpText[idx]}
        </span>
      );
    }
    return chars;
  };

  const renderKmpPattern = () => {
    if (currentStep === -1 || kmpSteps.length === 0) return kmpPattern;
    const step = kmpSteps[currentStep];
    const { q, i, status } = step;

    const chars = [];
    const patLength = kmpPattern.length;

    for (let idx = 0; idx < patLength; idx++) {
      let style = {};

      if (idx === q) {
        if (status === 'comparing') {
          style = { backgroundColor: '#ffe3e0', border: '1px solid #e63946', fontWeight: 'bold' };
        } else if (status === 'backtracking') {
          style = { backgroundColor: '#fff3cd', border: '1px solid #ffc107', fontWeight: 'bold' };
        }
      } else if (idx < q) {
        style = { backgroundColor: '#e2f0fe', color: '#0066cc' }; // Matched prefix
      }

      chars.push(
        <span key={idx} className="px-1 font-monospace fs-5 rounded" style={{ ...style, display: 'inline-block', minWidth: '1.2rem', textAlign: 'center' }}>
          {kmpPattern[idx]}
        </span>
      );
    }
    return chars;
  };

  return (
    <Container className="py-4">
      <div className="text-center mb-4">
        <h1 className="fw-bold text-gradient">Advanced Data Structures Lab</h1>
        <p className="text-secondary fs-5">
          Interactive execution visualizer for tree structures and search algorithms used in the <span className="fw-bold">CoFound</span> platform.
        </p>
      </div>

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4 custom-tabs"
      >
        {/* ================= RED-BLACK TREE TAB ================= */}
        <Tab eventKey="rbtree" title="Red-Black Tree Indexer">
          <Row>
            {/* Control Panel */}
            <Col lg={4}>
              <Card className="shadow-sm border-0 mb-4 bg-glass">
                <Card.Body>
                  <h4 className="fw-bold text-primary mb-3">Index Project Metadata</h4>
                  <p className="text-secondary small">
                    Startups are indexed by required <strong>Team Size Needed</strong>. Insert new projects to trigger RBTree properties, rotations, and node rebalancing.
                  </p>

                  <Form onSubmit={handleTreeInsert}>
                    <Form.Group className="mb-3">
                      <Form.Label className="small fw-semibold text-secondary">Team Size (Key)</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="e.g. 3"
                        min="1"
                        max="20"
                        value={rbKey}
                        onChange={(e) => setRbKey(e.target.value)}
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label className="small fw-semibold text-secondary">Project Title (Value)</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="e.g. Fintech App"
                        value={rbVal}
                        onChange={(e) => setRbVal(e.target.value)}
                        required
                      />
                    </Form.Group>
                    <div className="d-grid gap-2">
                      <Button variant="primary" type="submit" className="d-flex align-items-center justify-content-center gap-2">
                        <FiPlus /> Insert Project
                      </Button>
                      <Button variant="outline-danger" size="sm" onClick={handleClearTree} className="d-flex align-items-center justify-content-center gap-2">
                        <FiRotateCcw /> Reset Index
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>

              {/* Range Queries */}
              <Card className="shadow-sm border-0 mb-4 bg-glass">
                <Card.Body>
                  <h4 className="fw-bold text-primary mb-3">Index Range Lookup</h4>
                  <p className="text-secondary small">
                    Perform a tree-range traversal in $O(\log N + K)$ to find projects seeking team sizes within boundaries.
                  </p>

                  <Row className="mb-3">
                    <Col>
                      <Form.Label className="small fw-semibold text-secondary">Min Size</Form.Label>
                      <Form.Control
                        type="number"
                        value={rangeMin}
                        onChange={(e) => setRangeMin(parseInt(e.target.value) || 1)}
                      />
                    </Col>
                    <Col>
                      <Form.Label className="small fw-semibold text-secondary">Max Size</Form.Label>
                      <Form.Control
                        type="number"
                        value={rangeMax}
                        onChange={(e) => setRangeMax(parseInt(e.target.value) || 10)}
                      />
                    </Col>
                  </Row>
                  <Button variant="outline-primary" className="w-100 d-flex align-items-center justify-content-center gap-2 mb-3" onClick={handleRangeSearch}>
                    <FiSearch /> Query Range
                  </Button>

                  {rangeResults.length > 0 ? (
                    <div className="bg-light p-2 rounded max-height-200 overflow-auto">
                      <h6 className="fw-semibold text-dark mb-2">Query Results:</h6>
                      {rangeResults.map((r, i) => (
                        <div key={i} className="small border-bottom py-1 text-secondary">
                          <Badge bg="secondary" className="me-2">{r.key} members</Badge>
                          {r.value}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted small py-2 bg-light rounded">
                      No range query results yet.
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>

            {/* SVG Visualizer Canvas */}
            <Col lg={8}>
              <Card className="shadow-sm border-0 mb-4 bg-glass">
                <Card.Header className="bg-white border-0 py-3 d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 fw-bold text-dark">Red-Black Tree SVG Canvas</h5>
                  <div>
                    <Badge bg="danger" className="me-2">RED Node</Badge>
                    <Badge bg="dark">BLACK Node</Badge>
                  </div>
                </Card.Header>
                <Card.Body className="bg-light text-center rounded-bottom">
                  {treeInstance.root !== treeInstance.nil ? (
                    <div className="overflow-auto border rounded bg-white" style={{ minHeight: '380px' }}>
                      <svg width="800" height="360" className="tree-svg">
                        {svgElements}
                      </svg>
                    </div>
                  ) : (
                    <div className="d-flex flex-column align-items-center justify-content-center border rounded bg-white py-5" style={{ minHeight: '380px' }}>
                      <FiHelpCircle className="text-muted fs-1 mb-2" />
                      <p className="text-muted">The tree is empty. Add a project to visualize!</p>
                    </div>
                  )}
                </Card.Body>
              </Card>

              {/* Console Logs */}
              <Card className="shadow-sm border-0 bg-glass text-light" style={{ backgroundColor: '#1d2331' }}>
                <Card.Header className="border-secondary py-3">
                  <h5 className="mb-0 fw-semibold text-white">Rebalancing Rotation Logs</h5>
                </Card.Header>
                <Card.Body className="p-0">
                  <div className="font-monospace small p-3 text-start bg-dark rounded-bottom text-success" style={{ height: '140px', overflowY: 'auto' }}>
                    {treeLogs.map((log, index) => (
                      <div key={index} className="mb-1">
                        <span className="text-secondary">[{index + 1}]</span> {log}
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        {/* ================= KMP STRING MATCHING TAB ================= */}
        <Tab eventKey="kmp" title="KMP Search Matcher">
          <Card className="shadow-sm border-0 mb-4 bg-glass">
            <Card.Body>
              <h4 className="fw-bold text-primary mb-3">Dynamic Substring Search with Knuth-Morris-Pratt (KMP)</h4>
              <p className="text-secondary small">
                Unlike database matches, KMP runs in linear $O(N + M)$ time by building a prefix function array ($\pi$-array) that tells the matcher how much to shift the search pointer on a mismatch.
              </p>

              <Form onSubmit={handleKmpSubmit} className="mb-4">
                <Row className="g-3">
                  <Col md={7}>
                    <Form.Group>
                      <Form.Label className="small fw-semibold text-secondary">Target Description (Text)</Form.Label>
                      <Form.Control
                        type="text"
                        value={kmpText}
                        onChange={(e) => setKmpText(e.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label className="small fw-semibold text-secondary">Keyword (Pattern)</Form.Label>
                      <Form.Control
                        type="text"
                        value={kmpPattern}
                        onChange={(e) => setKmpPattern(e.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2} className="d-flex align-items-end">
                    <Button variant="primary" type="submit" className="w-100">
                      Compute KMP
                    </Button>
                  </Col>
                </Row>
              </Form>

              <Row>
                {/* Simulator Visualizer */}
                <Col lg={7} className="border-end">
                  <h5 className="fw-bold text-dark mb-3">Execution Panel</h5>
                  
                  {/* Step controls */}
                  <div className="bg-light p-3 rounded mb-3 text-center border">
                    <div className="mb-3 d-flex justify-content-center gap-2 align-items-center">
                      <Button variant="outline-secondary" size="sm" onClick={() => setCurrentStep(0)} disabled={currentStep <= 0}>
                        Reset
                      </Button>
                      <Button variant="outline-secondary" size="sm" onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))} disabled={currentStep <= 0}>
                        Prev
                      </Button>
                      <Button 
                        variant={isPlaying ? "danger" : "success"} 
                        size="sm" 
                        className="d-flex align-items-center gap-1"
                        onClick={() => setIsPlaying(!isPlaying)}
                      >
                        <FiPlay /> {isPlaying ? "Pause" : "Play Auto"}
                      </Button>
                      <Button variant="outline-secondary" size="sm" onClick={() => setCurrentStep(prev => Math.min(kmpSteps.length - 1, prev + 1))} disabled={currentStep >= kmpSteps.length - 1}>
                        <FiSkipForward /> Next
                      </Button>
                    </div>

                    <div className="small text-secondary mb-1">
                      Step: <strong>{currentStep + 1}</strong> of <strong>{kmpSteps.length}</strong>
                    </div>

                    {/* Speed Selector */}
                    <div className="d-flex justify-content-center align-items-center gap-2 mb-2">
                      <span className="small text-secondary">Playback Speed:</span>
                      <Form.Select 
                        size="sm" 
                        style={{ width: '120px' }} 
                        value={playSpeed}
                        onChange={(e) => setPlaySpeed(parseInt(e.target.value))}
                      >
                        <option value="1500">Slow (1.5s)</option>
                        <option value="1000">Normal (1.0s)</option>
                        <option value="500">Fast (0.5s)</option>
                      </Form.Select>
                    </div>
                  </div>

                  {/* Character Pointers Visual representation */}
                  {currentStep >= 0 && kmpSteps.length > 0 ? (
                    <div className="border rounded p-4 bg-white mb-3 shadow-sm text-center">
                      {/* Text characters line */}
                      <div className="mb-2">
                        <div className="text-secondary small mb-1">Text:</div>
                        <div className="d-flex flex-wrap justify-content-center gap-1">
                          {renderKmpText()}
                        </div>
                      </div>

                      {/* Pattern characters line aligned under text pointer */}
                      <div className="mt-4 pt-3 border-top">
                        <div className="text-secondary small mb-1">Pattern Window (Shifted):</div>
                        <div className="d-flex justify-content-center align-items-center gap-1">
                          {renderKmpPattern()}
                        </div>
                      </div>

                      {/* State Description */}
                      <Alert variant={
                        kmpSteps[currentStep].status === 'found_match' ? 'success' :
                        kmpSteps[currentStep].status === 'backtracking' ? 'warning' : 'info'
                      } className="mt-4 py-2 px-3 small mb-0">
                        {kmpSteps[currentStep].description}
                      </Alert>
                    </div>
                  ) : (
                    <div className="text-center text-muted py-5 bg-light rounded border">
                      Input text and pattern, then click Compute to start.
                    </div>
                  )}

                  {/* Matches Found */}
                  <div className="bg-light p-3 rounded border">
                    <h6 className="fw-semibold text-dark mb-2">Matches Found:</h6>
                    {currentStep >= 0 && kmpSteps[currentStep]?.matches.length > 0 ? (
                      <div className="d-flex gap-2">
                        {kmpSteps[currentStep].matches.map((idx, index) => (
                          <Badge bg="success" key={index} className="fs-6 py-2 px-3">
                            Index: {idx}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="small text-muted">No matches identified yet at this step.</span>
                    )}
                  </div>
                </Col>

                {/* Pi array / Prefix function table */}
                <Col lg={5}>
                  <h5 className="fw-bold text-dark mb-3">KMP Prefix Function Table ($\pi$-array)</h5>
                  <p className="text-secondary small">
                    This table maps each character of the pattern to the length of the longest proper prefix of the pattern that is also a suffix of the substring ending at that position.
                  </p>

                  <Table striped bordered hover size="sm" className="text-center font-monospace small bg-white">
                    <thead>
                      <tr className="bg-light">
                        <th>Index</th>
                        <th>Char</th>
                        <th>$\pi$[i] (Shift Value)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {kmpPattern.split('').map((char, index) => {
                        const isCurrentHighlight = currentStep >= 0 && kmpSteps[currentStep]?.q === index;
                        return (
                          <tr key={index} className={isCurrentHighlight ? "table-warning border border-warning" : ""}>
                            <td>{index}</td>
                            <td className="fw-bold text-primary">{char}</td>
                            <td>
                              <Badge bg={kmpPi[index] > 0 ? "success" : "secondary"}>
                                {kmpPi[index] !== undefined ? kmpPi[index] : 0}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>

                  <Card className="border-0 shadow-sm mt-3" style={{ backgroundColor: '#e2f0fe' }}>
                    <Card.Body className="small text-dark py-2 px-3">
                      <strong>$\pi$-array Explanation:</strong> On mismatch at index <code>q</code>, instead of resetting the search pointer all the way to 0, KMP shifts the pattern pointer to index <code>$\pi$[q - 1]</code>, saving redundant character comparisons and achieving $O(N + M)$ performance.
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default DataStructuresVisualizer;
