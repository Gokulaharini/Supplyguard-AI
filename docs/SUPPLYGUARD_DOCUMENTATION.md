# SUPPLYGUARD AI – COMPLETE PROTOTYPE EXPLANATION & ARCHITECTURE DOCUMENTATION
**Predict. Recover. Protect.**
Autonomous Supply Chain Digital Twin & Decision Optimization Agent

---

## 1. Project Overview

**SupplyGuard AI** is a production-grade full-stack web application that serves as an **Autonomous Supply Chain Digital Twin & Recovery Agent**. It models an end-to-end electronics manufacturing supply chain, detects upstream and downstream disruptions in real time, traces the downstream blast radius across multiple network tiers, calculates financial and SLA breach exposure, and generates physically validated, multi-criteria optimized recovery strategies.

### Operational Philosophy
- **Deterministic Math for Business Invariants:** Calculations for inventory depletion, production line stalls, lead times, SLA penalties, and constraint satisfaction use verified mathematical formulas.
- **Language Models for Reasoning & Explanation:** Google Gemini AI (`gemini-3.8-flash`) synthesizes situational reports, explains multi-criteria trade-offs, and drafts executive briefings.
- **Responsible AI / Human-in-the-Loop:** AI agents formulate and rank recovery strategies, but operational execution requires authorized human sign-off recorded in an immutable audit ledger.

---

## 2. Problem Statement

Modern global supply chains operate on tight, "just-in-time" (JIT) margins with minimal buffer stocks. When a Tier-1 supplier suffers an unexpected outage (e.g., electrical substation burnout, natural disaster, port strike):

1. **Delayed Visibility:** Operations teams often discover shortages only when factory assembly lines run out of physical parts, days after the upstream failure.
2. **Hidden Downstream Dependencies:** A raw material bottleneck (e.g., high-purity copper foil) cascades across multiple assembly facilities, transshipment hubs, and regional distribution centers, jeopardizing high-priority customer contracts.
3. **Severe Financial & SLA Penalties:** Enterprise contracts in aerospace, healthcare, and telecommunications enforce strict service level agreements (SLAs) with daily liquidated damages exceeding $20,000–$35,000 per day.
4. **Suboptimal Manual Triage:** Human planners struggle to balance competing goals—minimizing expedite costs, meeting SLA delivery deadlines, preserving internal safety buffers, and limiting carbon emissions—often defaulting to expensive brute-force air charters.

**SupplyGuard AI solves this** by executing automated graph dependency tracing, inventory burn rate calculations, and deterministic Pareto multi-objective optimization within milliseconds of a disruption trigger.

---

## 3. How SupplyGuard AI Works: End-to-End Workflow

```
[Disruption Detected] (e.g., S1 Smelter Outage)
         │
         ▼
[Digital Twin Graph Traversal] (Dependency Tracer)
         │ Identifies: Material M1 ➔ Factories F1, F2, F3 ➔ DCs ➔ Customer Orders
         ▼
[Deterministic Impact Assessment] (Impact Service)
         │ Calculates: F1 stockout in 1.6 days, 5,842 units lost, $2.58M total exposure
         ▼
[Autonomous Recovery Formulation] (Scenario Generator)
         │ Generates: 4 distinct strategies (Supplier Expedite, Reallocation, Rescheduling, Hybrid)
         ▼
[Physical Constraint Validation] (Constraint Validator)
         │ Checks: Material compatibility, supplier capacity, safety stock floors, budget caps
         ▼
[Multi-Criteria Scoring Engine] (Deterministic Optimization)
         │ Applies weights: SLA (30%), Cost (20%), Speed (15%), Customer (15%), Risk (10%), Green (10%)
         ▼
[AI Multi-Agent Synthesis] (Gemini 3.8 Flash / Orchestrator Agent)
         │ Generates situational debriefs, trade-off explanations, and evidence citations
         ▼
[Human-in-the-Loop Authorization] (Approval & Audit Ledger)
         │ Human operator reviews checklist, inputs justification, and signs off
```

---

## 4. Dataset Explanation

### Where the Dataset is Stored
- **Location:** `src/server/database/synthetic-data.ts`
- **Data Source:** High-fidelity, strongly-typed synthetic dataset modeled directly in TypeScript.
- **Persistence State:** In-memory operational state with real-time mutation tracking via `src/server/simulation/disruption.simulator.ts`. (PostgreSQL/Prisma are not active in this prototype; all operations run deterministically in-memory).

### Dataset Entities & Counts

| Entity Tier | Count | Description |
| :--- | :--- | :--- |
| **Suppliers** | **6** | Tier-1 and Tier-2 global component suppliers (Chile, USA, Taiwan, Korea, Germany, Japan) |
| **Materials** | **5** | Core Bill of Materials (BOM) elements: Copper foil, micro-wafers, OLEDs, thermal resin, titanium screws |
| **Factories** | **3** | Assembly plants: Shenzhen Alpha (China), Penang Beta (Malaysia), Austin Gamma (USA) |
| **Distribution Centres** | **3** | Transshipment hubs: Rotterdam (Euro-Hub), Los Angeles (Pacific-Hub), Singapore (Asian-Hub) |
| **Retail Depots / Stores** | **4** | Regional fulfillment hubs: Frankfurt, Silicon Valley, Tokyo East, Chicago North |
| **Customer Enterprises** | **8** | Enterprise accounts across Aerospace, Cloud, Telecom, Medical, Defense, Automotive, and Consumer |
| **Customer Orders** | **12** | Active purchase orders with contractual values, promised delivery days, and daily SLA penalty clauses |
| **Transport Routes** | **12** | Multi-modal shipping lanes: Maritime, Air charter, Rail, and Road with costs, transit times, and carbon data |

### Sample Dataset Records

#### 1. Primary Supplier S1 (`INITIAL_SUPPLIERS[0]`)
```typescript
{
  id: 'S1',
  name: 'Apex Metalworks Ltd',
  tier: 'tier-1',
  country: 'Chile',
  location: 'Antofagasta Refineries',
  materialsProvided: ['M1'],
  dailyCapacityUnits: 1200,
  nominalLeadTimeDays: 7,
  expediteLeadTimeDays: 3,
  expediteCostMultiplier: 1.45,
  reliabilityScore: 0.94,
  co2PerUnitKg: 3.2,
  status: 'nominal',
  notes: 'Primary global supplier of high-purity electrolytic copper foil (M1). Handles 80% baseline volume.'
}
```

#### 2. Assembly Factory F1 (`INITIAL_FACTORIES[0]`)
```typescript
{
  id: 'F1',
  name: 'Shenzhen Alpha Assembly Facility',
  location: 'Shenzhen Industrial Zone, China',
  dailyFinishedProductCapacity: 250,
  inventoryOnHand: { M1: 1600, M2: 2500, M3: 3000, M4: 4000, M5: 8000 },
  safetyStockFloor: { M1: 2000, M2: 1500, M3: 1200, M4: 1500, M5: 2500 },
  dailyConsumptionRate: { M1: 1000, M2: 250, M3: 250, M4: 500, M5: 500 },
  operationalCostPerDayUSD: 42000,
  outputProducts: ['ComputeEngine-X1', 'IoT-Gateway-Pro']
}
```

#### 3. Critical Customer Order ORD-103 (`INITIAL_ORDERS[2]`)
```typescript
{
  id: 'ORD-103',
  orderNumber: 'SG-2026-CLD-03',
  customerName: 'QuantumByte Systems Cloud',
  customerSegment: 'cloud',
  productId: 'ComputeEngine-X1',
  quantityUnits: 1200,
  totalOrderValueUSD: 1450000,
  promisedDeliveryDay: 6,
  priority: 'critical',
  slaPenaltyPerDayUSD: 35000,
  slaMaxGraceDays: 2,
  fulfillingFactoryId: 'F1',
  distributionCentreId: 'DC2'
}
```

---

## 5. Algorithms and Mathematical Engines

### 1. Downstream Topological Graph Traversal & Blast Radius Propagation
- **Location:** `src/server/digital-twin/dependency.tracer.ts` (`traceDownstreamBlastRadius`)
- **What it does:** Executes forward dependency propagation starting from a disrupted node across the 6-tier supply network.
- **How it works:**
  1. Identifies the failed node (e.g., `S1`).
  2. Finds all downstream materials (`materialsProvided`: `['M1']`).
  3. Maps materials to assembly facilities consuming them via the Bill of Materials (`standardBOMUsage`).
  4. Traces affected factories to downstream distribution centers (`connectedFactories`).
  5. Identifies all customer purchase orders fulfilled by those factories or transshipped via those DCs.
- **Inputs:** `disruptedEntityId: string` (e.g. `'S1'`).
- **Outputs:** `TraceResult` containing affected materials, factories, distribution hubs, customer orders, and bottleneck analysis text.

### 2. Factory Buffer Exhaustion & Stockout Prediction
- **Location:** `src/server/services/impact.service.ts` (`calculateDownstreamImpact`)
- **What it does:** Calculates the exact timeline until a factory depletes its raw material safety buffer and shuts down its assembly lines.
- **Formula:**
  $$\text{Days Remaining} = \frac{\text{Inventory On Hand (units)}}{\text{Daily Consumption Rate (units/day)}}$$
- **Example:**
  - Factory F1 has 1,600 units of M1 Copper Foil.
  - Daily consumption: 250 finished assemblies $\times$ 4 BOM units = 1,000 units/day.
  - $\text{Stockout Day} = \frac{1600}{1000} = 1.6 \text{ days}$.
  - Because 1.6 days $<$ 14 days outage, F1 halts on Day 1.6, losing $14 - 1.6 = 12.4$ production days $\approx 3,100$ finished units and $\$520,800$ in unabsorbed idle overhead.

### 3. Customer SLA Delay & Contractual Penalty Calculation
- **Location:** `src/server/services/impact.service.ts`
- **What it does:** Computes the revised delivery date for each order and calculates liquidated damages.
- **Formula:**
  $$\text{Chargeable Delay Days} = \max(0, \text{Delay Days} - \text{SLA Grace Days})$$
  $$\text{SLA Penalty (USD)} = \text{Chargeable Delay Days} \times \text{Daily SLA Penalty Rate}$$
- **Example (Order ORD-103):**
  - Promised Day: 6. Factory F1 stalls on Day 1.6. Estimated delay: 10 days.
  - Grace Period: 2 days.
  - Chargeable Delay: $10 - 2 = 8$ days.
  - Penalty: $8 \times \$35,000 = \$280,000$.

### 4. Physical & Operational Constraint Validation
- **Location:** `src/server/optimization/constraint.validator.ts` (`validatePlanConstraints`)
- **What it does:** Verifies that a proposed recovery strategy does not violate operational, physical, or financial boundaries.
- **Constraints Checked:**
  1. **Material Compatibility:** Checks ASTM / military compliance.
  2. **Supplier Allocation Capacity:** Ensures alternative supplier allocation does not exceed maximum daily capacity (e.g., S2 max capacity is 800 units/day).
  3. **Safety Stock Floor Preservation:** Confirms that diverting inventory from surplus facilities (F3) does not breach minimum safety stock floors ($\text{Remaining} \ge \text{Safety Floor}$).
  4. **Factory Assembly Throughput:** Verifies surge capacity $\le 92\%$.
  5. **Logistics Lead Time:** Ensures expedited transit time $\le$ deadline.
  6. **Budget Ceiling:** Verifies plan execution cost $\le \$500,000$ USD authorization limit.
- **Critical Dynamic Behavior:** When S2 fails during the surprise scenario, Plan A is flagged as `passed: false` and `isFeasible: false`.

### 5. Multi-Criteria Weighted Optimization & Pareto Ranking
- **Location:** `src/server/optimization/scoring.engine.ts` (`scoreAndRankPlans`)
- **What it does:** Normalizes criteria scores and computes a deterministic composite score:
  $$\text{Composite Score} = w_{\text{sla}} S_{\text{sla}} + w_{\text{cost}} S_{\text{cost}} + w_{\text{speed}} S_{\text{speed}} + w_{\text{cust}} S_{\text{cust}} + w_{\text{risk}} S_{\text{risk}} + w_{\text{green}} S_{\text{green}}$$
- **Default Weights:**
  - SLA Preservation ($w_{\text{sla}}$): **30%**
  - Cost Efficiency ($w_{\text{cost}}$): **20%**
  - Recovery Speed ($w_{\text{speed}}$): **15%**
  - Customer Shielding ($w_{\text{cust}}$): **15%**
  - Operational Risk Mitigation ($w_{\text{risk}}$): **10%**
  - Sustainability / Green Index ($w_{\text{green}}$): **10%**
- **Feasibility Invariant:** If a plan is marked infeasible (`isFeasible === false`), its composite score is heavily penalized (multiplied by 0.4 and capped at 35), guaranteeing that **an infeasible plan can never achieve Rank #1**.

---

## 6. Technology Stack

| Layer | Technology | Actual Status | Purpose in Prototype |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | React 19 + TypeScript | **Actively Used** | Component architecture, state hooks, high-density dashboard UI |
| **Build & Tooling** | Vite 8 + TSX | **Actively Used** | Dev bundling, rapid HMR, server-side TS execution |
| **Styling** | Tailwind CSS v4 | **Actively Used** | Custom dark mode palette, typography hierarchy, responsive layouts |
| **Digital Twin Graph** | `@xyflow/react` (React Flow) | **Actively Used** | Interactive 6-tier graph canvas, custom nodes, handles, minimap |
| **Data Visualization** | Recharts | **Actively Used** | Bar charts and 6-axis radar charts for trade-off comparison |
| **Icons** | Lucide React | **Actively Used** | Semantic operational icons across nodes, tiers, and status badges |
| **Server Framework** | Express 4.21 | **Actively Used** | REST API endpoints, simulation state orchestration, Vite dev middleware |
| **AI Integration** | Google GenAI SDK (`@google/genai`) | **Actively Used** | Server-side Gemini 3.8 Flash queries with structured prompt engineering |
| **Fallback Engine** | Deterministic Expert Rule Engine | **Actively Used** | Seamless demo mode when Gemini API key is absent or offline |
| **Relational Database** | PostgreSQL / Prisma | **Not Connected** | Prototype uses in-memory typed state; DB setup is planned for future persistence |
| **Test Runner** | In-App Benchmark Runner | **Actively Used** | 10 automated test scenarios executing invariant checks in `<1ms` |

---

## 7. Software Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CLIENT / BROWSER (Vite SPA)                     │
│  React 19 Components · React Flow Canvas · Recharts · Tailwind CSS v4   │
│  Pages: Dashboard · Digital Twin · Disruptions · Impact · Recovery ·   │
│         Scenarios · AI Assistant · Evidence · Evaluations · Approvals  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / JSON REST Calls
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        FULL-STACK EXPRESS BACKEND                      │
│  Entry Point: server.ts (Port 3000)                                    │
│  Router: src/server/routes/api.routes.ts                               │
├────────────────────────────────────────────────────────────────────────┤
│                         BUSINESS LOGIC ENGINES                         │
│  • Graph Traversal & Dependency Tracer (dependency.tracer.ts)          │
│  • Digital Twin Graph Builder (graph.builder.ts)                       │
│  • Disruption Simulation State Manager (disruption.simulator.ts)      │
│  • Deterministic Impact & SLA Damage Service (impact.service.ts)       │
│  • Recovery Strategy Generator (scenario.generator.ts)                 │
│  • Multi-Constraint Feasibility Validator (constraint.validator.ts)   │
│  • Deterministic Scoring & Pareto Ranking Engine (scoring.engine.ts)   │
│  • Human Approval & Audit Ledger (approval.service.ts)                 │
│  • Benchmark Test Harness (test.runner.ts & test.scenarios.ts)         │
├───────────────────────────────────┬────────────────────────────────────┤
│         SYNTHETIC DATA            │       AI REASONING LAYER           │
│  In-Memory Electronics Dataset    │  Google GenAI SDK (@google/genai)  │
│  (src/server/database/            │  Model: gemini-3.8-flash           │
│   synthetic-data.ts)              │  Header: 'User-Agent: aistudio-...'│
│  6 Suppliers · 5 Materials        │  + Deterministic Fallback Engine   │
│  3 Factories · 3 DCs · 8 Clients  │  (orchestrator.agent.ts)           │
└───────────────────────────────────┴────────────────────────────────────┘
```

---

## 8. Feature-by-Feature Deep Dive

### 1. Command Centre Dashboard (`src/pages/DashboardPage.tsx`)
- **What it does:** Executive overview showing resilience score (98% nominal down to 34% in crisis), total value at risk ($2.58M), at-risk customer orders, and Rank #1 recovery recommendations.
- **Key Interactions:**
  - `Simulate S1 14-Day Failure`: Immediately injects the primary crisis.
  - `Inject Surprise: S2 Fails`: Injects secondary disaster.
  - `Reset Simulation`: Restores the system to nominal baseline.

### 2. Supply Chain Digital Twin (`src/pages/DigitalTwinPage.tsx`)
- **What it does:** Interactive graph canvas displaying all entities arranged in 6 logical columns: Suppliers $\rightarrow$ Materials $\rightarrow$ Factories $\rightarrow$ DCs $\rightarrow$ Stores $\rightarrow$ Customers.
- **Key Interactions:**
  - Pan, zoom, and minimap navigation.
  - Tier filters: filter to view only Suppliers, Factories, etc.
  - Live search bar for instant entity filtering.
  - Clicking any node opens the **Node Inspector Drawer** displaying inventory buffers, consumption rates, and a button to **Trace Downstream Blast Radius**.

### 3. Disruption Simulator (`src/pages/DisruptionPage.tsx`)
- **What it does:** Laboratory for testing supply chain vulnerabilities.
- **Key Interactions:**
  - One-click triggers for preset crises (S1 Outage, S2 Surprise Flood).
  - Custom Disruption Builder: configure entity, duration (1–60 days), disruption type (outage, capacity reduction, lead time surge, transport block, demand surge), and severity.

### 4. Impact Analysis & Blast Radius (`src/pages/ImpactAnalysisPage.tsx`)
- **What it does:** Detailed breakdown of factory stockout predictions, production deficits, and individual customer order SLA liabilities.
- **Key Displays:**
  - Days-of-Inventory progress bar per factory.
  - At-Risk Customer Orders Table detailing Promised Day vs. Estimated Delivery Day and exact calculated liquidated damages.

### 5. Autonomous Recovery Planning (`src/pages/RecoveryPlanningPage.tsx`)
- **What it does:** Generates and presents 4 distinct operational recovery strategies (A, B, C, D).
- **Key Displays:**
  - Strategy cards with feasibility indicators (FEASIBLE vs. INFEASIBLE).
  - Action item checklist (quantities, logistics routes, costs, lead times).
  - Physical constraint validation matrix.
  - `Submit for Executive Sign-off` button to route the plan to the human approval queue.

### 6. Scenario Comparison & Optimization (`src/pages/ScenarioComparisonPage.tsx`)
- **What it does:** Mathematical trade-off analysis comparing plans across SLA, cost, speed, customer protection, risk, and green metrics.
- **Key Interactions:**
  - Dynamic weight adjustment sliders (5% to 60%) that instantly re-score and re-rank plans in real time.
  - Recharts Bar Chart and 6-axis Radar Chart.

### 7. Gemini AI Decision Assistant (`src/pages/AIAssistantPage.tsx`)
- **What it does:** Interactive multi-agent consultation console.
- **Available Personas:** Master Orchestrator, Disruption Intelligence, Blast Radius Specialist, Recovery Formulation Agent, Optimization Specialist, and Executive Transparency Agent.
- **Key Features:** Pre-built quick prompt chips, real-time Gemini generation (or expert fallback), metric citations, and ground-truth references.

### 8. Evidence & Audit Traceability (`src/pages/EvidencePage.tsx`)
- **What it does:** Transparent algorithmic ledger showing how raw data inputs yield mathematical conclusions.
- **Categorization:** Clearly tags each finding as `Known Data`, `Calculated Estimate`, or `Simulation Assumption` with confidence scores.

### 9. Evaluation & Benchmark Testing Centre (`src/pages/EvaluationPage.tsx`)
- **What it does:** Automated quality assurance test harness containing 10 predefined benchmark stress scenarios.
- **Key Capabilities:** Runs full suite or individual tests, verifying invariant checks (e.g. Rank #1 plan feasibility) with sub-millisecond execution times.

### 10. Human Approval & Governance Ledger (`src/pages/ApprovalsPage.tsx`)
- **What it does:** Enforces Responsible AI. Submitted recovery plans enter a pending queue where human executives can authorize or reject plans with a typed justification and digital signature.
- **Audit Ledger:** Displays an immutable log of all historical events and decisions.

### 11. Settings & Data Management (`src/pages/SettingsPage.tsx`)
- **What it does:** Allows inspection of raw synthetic datasets across all 4 primary tables, provides global state reset, and exports the full dataset as JSON.

---

## 9. Complete Walkthrough: The S1 Disruption Scenario

### Step 1: Initial Nominal State
- All 6 suppliers operate at nominal capacity.
- Shenzhen Alpha (F1) has 1,600 units of M1 Copper Foil on hand, consuming 1,000 units/day.
- All 12 customer orders are on schedule. Value at risk: $0. SLA penalties: $0. Resilience Index: 98%.

### Step 2: Triggering S1 Outage
- Operator clicks **Simulate S1 Failure** on the Dashboard or Disruption Simulator.
- S1 (Apex Metalworks in Chile) suffers a 14-day complete power failure. Active disruptions count increases to 1.

### Step 3: Graph Traversal & Blast Radius Propagation
- The digital twin traces S1 $\rightarrow$ Material M1.
- M1 connects downstream to Factories F1 (Shenzhen), F2 (Penang), and F3 (Austin).
- Dependency tracer calculates stockout dates:
  - F1 depletes stock in **1.6 days**.
  - F2 depletes stock in **4.1 days**.
  - F3 depletes stock in **6.0 days**.
- Total production deficit across the 14-day outage: **5,842 units**.

### Step 4: Customer Order Impact
- Traces affected factories to downstream distribution centers and orders.
- 10 orders face delivery delays exceeding their SLA grace periods.
- Total contractual liquidated damages: **$1,296,000**.
- Factory idle line overhead: **$1,291,700**.
- Total financial exposure: **$2,587,700**. Resilience index falls to **34% (Critical Alert)**.

### Step 5: Formulation of the 4 Recovery Strategies
1. **Strategy A (Alternative Supplier Procurement):** Shift procurement to secondary supplier S2 (Global Copper Works in Utah) via expedited transatlantic air charter. Cost: $384k. SLA Protection: 92.5%.
2. **Strategy B (Inventory Reallocation):** Divert 1,400 units of M1 surplus buffer from Austin F3 and 400 sub-assemblies from Singapore DC3. Cost: $215k. SLA Protection: 84.0%.
3. **Strategy C (Production Rescheduling & SLA Priority Queue):** Prioritize critical aerospace (AeroTech) and surgical medical (MedTech) orders; delay consumer orders within grace periods. Cost: $125k. SLA Protection: 76.5%.
4. **Strategy D (Autonomous Multi-Modal Hybrid Recovery):** Air-charter 800 units of emergency buffer from Austin F3 (arriving in 48 hours to avert the Day 1.6 stall), combined with 3,200 units of secondary procurement and priority queue re-sequencing. Cost: $268k. SLA Protection: 96.0%.

### Step 6: Constraint Checking & Ranking
- All 4 plans are checked against material compatibility, supplier capacity, safety stock floors, and budget limits. All pass constraint checks.
- Applying default weights, **Strategy D achieves Rank #1 with a score of 81.7/100**, completely eliminating Tier-1 SLA breaches at a fraction of unmitigated damages ($268k vs. $2.58M).

### Step 7: Dynamic Adaptation (The Surprise Scenario)
- Operator clicks **Inject Surprise: S2 Fails**.
- Secondary supplier S2 in Utah suffers flash flooding.
- S2 capacity drops to 0 units/day.
- **Immediate recalculation:** Constraint validator marks Strategy A as **INFEASIBLE** (`Supplier Allocation Capacity: FAILED`). Strategy A's score drops to 32/100.
- Strategy D dynamically re-routes procurement to European reserve stocks and remains the recommended feasible plan.

---

## 10. Prototype Demonstration Guide (5–7 Minute Walkthrough)

| Minute | Screen / Page | Presenter Action | What to Say / Highlight |
| :---: | :--- | :--- | :--- |
| **0:00 – 1:00** | **Command Centre Dashboard** | Show the initial nominal state. Point to Resilience Score (98%) and 0 Value at Risk. | *"SupplyGuard AI is an autonomous digital twin that continuously monitors supply chain health. Currently, all 6 tiers are nominal."* |
| **1:00 – 2:00** | **Digital Twin Graph** | Navigate to **Digital Twin**. Zoom in. Click on Supplier `S1` and Factory `F1`. | *"Here is the interactive topological digital twin. We see the entire flow from Tier-1 suppliers to enterprise customers. Clicking F1 shows its on-hand inventory and consumption rates."* |
| **2:00 – 3:00** | **Disruption Simulator** | Go to **Disruption Simulator**. Click **Simulate S1 Failure**. | *"Let's simulate a real-world crisis: our primary copper supplier S1 in Chile suffers an electrical substation fire, shutting down for 14 days."* |
| **3:00 – 4:00** | **Impact Analysis** | Click **View Calculated Impact**. Show the Stockout Progress Bars and Orders Table. | *"Notice how the system immediately calculates that Shenzhen F1 runs out of copper in exactly 1.6 days. 10 customer orders are now in breach, exposing us to $2.58 million in damages."* |
| **4:00 – 5:00** | **Recovery Planning & Scenarios** | Navigate to **Recovery Planning**. Show the 4 generated strategies. Switch to **Scenario Optimization**. Tweak the SLA slider. | *"SupplyGuard doesn't just sound alarms—it generates 4 distinct recovery strategies. The engine recommends Strategy D, a hybrid plan saving $2.3M. On the optimization page, we can dynamically adjust objective weights."* |
| **5:00 – 6:00** | **Surprise Scenario & AI Assistant** | Click **Inject Surprise: S2 Fails**. Show Strategy A becoming INFEASIBLE. Open **AI Assistant** and click a prompt chip. | *"Watch this: a secondary crisis hits—S2 floods. Strategy A instantly becomes infeasible! Our Gemini AI assistant immediately debriefs us on the updated trade-offs."* |
| **6:00 – 7:00** | **Approvals & Evaluations** | Open **Approvals**, authorize Plan D, and open **Evaluations** to run the 10 automated benchmark tests. | *"Finally, upholding Responsible AI, Plan D is dispatched to the Human Approval queue for sign-off. Our automated evaluation suite passes 10/10 benchmark scenarios in under 1 millisecond."* |

---

## 11. Technical Strengths & Current Limitations

### Five Strongest Technical Features
1. **Mathematical Invariant Discipline:** No hallucinated quantities or scores. All inventory burn rates, lead times, SLA penalties, and constraint checks are deterministic.
2. **Dynamic Multi-Tier Adaptation:** When a secondary disruption occurs (S2 fails), the engine re-evaluates physical constraints and disqualifies invalid plans in real time.
3. **Interactive React Flow Digital Twin:** Smooth visualization of the 6-tier supply network with custom inspection and blast radius tracing.
4. **Sub-Millisecond Multi-Criteria Optimization:** Dynamic weighted Pareto scoring recalculates instantaneously upon slider adjustment.
5. **Responsible AI by Design:** Human sign-off workflow with complete evidence traceability and immutable audit logging.

### Current Implementation Limitations & Missing Integrations
1. **In-Memory State:** Data is maintained in-memory via TypeScript models rather than persisted in a live PostgreSQL database. Restarting the Node server resets the simulation state.
2. **Synthetic Demonstration Dataset:** The 6 suppliers, 3 factories, and 12 orders are modeled after real electronics supply chains, but are synthetic demonstration records.
3. **Single Active Simulation Session:** State is shared globally across the server rather than partitioned by multi-tenant user accounts.
4. **Predefined Route Graph:** Transport lanes and BOM usage are fixed structures rather than dynamically discovered via external logistics APIs (e.g., Freightos or SAP).
5. **One-Way Execution:** Approving a plan records the authorized decision in the audit log, but does not dispatch real-world EDI/ERP purchase orders to external enterprise software.

---

## 12. Likely Hackathon Judge Questions & Recommended Answers

### Q1: "Is this just an LLM making up recovery plans and costs?"
**Answer:** *"No. Gemini never invents quantities, inventory numbers, or scores. All stockout dates, SLA liquidated damages, and candidate recovery plans are generated by deterministic TypeScript algorithms. Gemini is strictly utilized for natural language reasoning, situational summarization, and executive debriefs."*

### Q2: "What happens if an alternative supplier does not have enough capacity?"
**Answer:** *"Our constraint validation engine checks supplier allocation against published capacity limits. In our dynamic surprise scenario, when secondary supplier S2 fails, its capacity drops to zero. Strategy A immediately fails the capacity constraint, is flagged as INFEASIBLE, and is barred from being selected as the recommended plan."*

### Q3: "How does the digital twin differ from a static diagram?"
**Answer:** *"It is a fully reactive, data-driven graph. The nodes, edges, color-coded statuses, flow rates, and blast radius highlights update dynamically based on the current simulation state, active disruptions, and calculated inventory deficits."*

### Q4: "Can operators customize the optimization goals?"
**Answer:** *"Yes. Through the Scenario Comparison module, operators can adjust the relative weights of SLA Preservation, Cost Efficiency, Recovery Speed, Customer Shielding, Operational Risk, and Sustainability from 5% to 60%. The Pareto ranking updates in real time."*

### Q5: "How does SupplyGuard prevent AI hallucinations from causing business damage?"
**Answer:** *"We enforce a strict Human-in-the-Loop governance model. Autonomous agents formulate and rank plans, but consequential actions must be approved by an authorized executive. Every conclusion is linked to verified telemetry data in our Evidence and Traceability matrix."*
