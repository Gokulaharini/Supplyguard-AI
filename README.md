# SupplyGuard AI – Predict. Recover. Protect.

### Autonomous Supply Chain Digital Twin Recovery Agent

**Challenge:** Challenge 09 – Autonomous Supply Chain Digital Twin Recovery Agent  
**Theme:** Theme 2 – AI for Business  
**Domain:** Supply Chain Management  
**Use Case:** Smartphone Manufacturing Supply Chain

---

## 1. Project Overview

SupplyGuard AI is an AI-enabled supply chain digital twin and recovery decision-support system designed to help businesses understand, analyse and respond to unexpected supply chain disruptions.

Modern supply chains depend on multiple suppliers, materials, factories, distribution centres, transportation routes and customers. A disruption at one point can create a chain reaction across the entire network.

SupplyGuard AI represents this supply chain digitally, simulates disruptions, identifies their downstream impact and evaluates alternative recovery plans.

Instead of simply detecting a problem, the system helps decision-makers understand the consequences and select suitable recovery strategies.

**Our vision: Predict. Recover. Protect.**

---

## 2. Problem Statement

Supply chains are vulnerable to unexpected events such as:

- Supplier failures.
- Raw material shortages.
- Factory capacity problems.
- Transportation delays.
- Inventory shortages.
- Unexpected increases in customer demand.

A disruption at one supplier can affect several factories, production schedules, customer orders and delivery commitments.

Traditional approaches often involve disconnected systems and manual decision-making, making it difficult to understand the complete impact and identify the best recovery strategy.

### Our Solution

SupplyGuard AI aims to address these challenges by:

1. Representing the supply chain as a digital twin.
2. Detecting and simulating supply chain disruptions.
3. Tracing affected dependencies throughout the network.
4. Calculating inventory shortages and potential SLA risks.
5. Generating alternative recovery strategies.
6. Comparing recovery plans using multiple business criteria.
7. Explaining recommendations with supporting evidence.
8. Keeping humans in control of important decisions.

---

## 3. Supply Chain Model

SupplyGuard AI models the following supply chain:

**Supplier → Material → Factory → Distribution Centre → Store → Customer**

Each entity is connected through dependencies.

When a supplier becomes unavailable, the system can analyse how the disruption may affect connected materials, factories, inventory, orders and customers.

### Smartphone Manufacturing Use Case

The project uses a smartphone manufacturing scenario.

Example components include:

- OLED Display Screen
- Lithium-Ion Battery
- Smartphone Processor (SoC)
- Camera Module
- RAM and Storage Chip
- Smartphone Motherboard
- Touchscreen Glass
- USB-C Charging Port
- Speaker and Microphone Module
- Smartphone Body and Frame
- SIM Card Connector
- Power Management IC

### Bill of Materials (BOM)

BOM stands for Bill of Materials.

It represents the components and quantities required to manufacture one finished smartphone.

For example, a smartphone may require one display, one battery, one processor and multiple other components.

BOM information helps connect component shortages to production impact.

---

## 4. Key Features

### 4.1 Command Centre Dashboard
Provides an overview of the supply chain, important indicators and disruption-related information.

### 4.2 Digital Twin Visualization
Displays the connected supply chain network and its relationships.

### 4.3 Disruption Simulator
Allows users to introduce simulated supply chain disruptions, such as supplier unavailability.

### 4.4 Impact Analysis
Identifies affected materials, factories, inventory, customer orders and potential SLA risks.

### 4.5 Recovery Planning
Evaluates alternative recovery strategies to help reduce disruption impact.

### 4.6 Scenario Comparison
Allows different recovery options to be compared using business criteria.

### 4.7 AI Assistant
Uses Google Gemini AI to support natural-language interaction, reasoning and explanations.

### 4.8 Evidence and Traceability
Connects recommendations to relevant supply chain information and validation results.

### 4.9 Evaluation Centre
Provides a framework for assessing system performance through measurable evaluation criteria.

### 4.10 Human Approval and Audit Log
Supports human review and records approval-related decisions.

### 4.11 Settings and Data Management
Provides access to project configuration and synthetic demonstration data.

---

## 5. Technology Stack

| Category | Technology |
|---|---|
| Frontend Framework | React 19 |
| Programming Language | TypeScript |
| Backend Runtime | Node.js |
| Backend Framework | Express.js |
| Generative AI | Google Gemini API |
| Digital Twin Visualization | React Flow |
| Simulation Engine | TypeScript |
| Data Layer | In-memory synthetic dataset |
| Optimization | Custom TypeScript algorithms |

**Database Note:** The current prototype uses an in-memory synthetic TypeScript dataset. An external database such as PostgreSQL is not currently connected, according to the project inspection report.

---

## 6. AI Architecture

SupplyGuard AI follows this logical architecture:

### INPUT

The system receives:

- Disruption events.
- Supplier status.
- Material inventory.
- Bill of Materials.
- Customer orders.
- Transportation routes.
- Factory capacity.

### AI AGENTS

The proposed agent architecture includes:

- Orchestrator Agent
- Disruption Analysis Agent
- Impact Analysis Agent
- Recovery Planning Agent
- Optimization Agent
- Explanation Agent

### TOOLS AND ENGINE

The backend performs:

- Dependency graph traversal.
- Inventory impact calculations.
- SLA and order risk calculations.
- Constraint validation.
- Recovery plan scoring and comparison.

### DATA AND KNOWLEDGE

The system uses synthetic supply chain information covering:

- Suppliers.
- Materials.
- Factories.
- Distribution centres.
- Stores.
- Customer orders.
- Transportation routes.
- BOM information.

### DECISIONS

Potential recovery strategies include:

- Alternative supplier selection.
- Inventory reallocation.
- Production rescheduling.
- Compatible material substitution.
- Customer prioritization.
- Transportation rerouting.

### HUMAN CONTROL

A human decision-maker reviews and approves the recommended recovery plan before real-world execution.

### OUTPUT

The system aims to provide:

- Disruption impact analysis.
- Ranked recovery plans.
- AI-generated explanations.
- Supporting evidence.
- Approval records and audit trail.

---

## 7. Algorithms Used

### 7.1 Graph Traversal – BFS / DFS

**Purpose:** Identifies downstream dependencies affected by a disruption.

When a supplier fails, graph traversal helps identify connected materials, factories, distribution centres, stores and customers.

### 7.2 Inventory Depletion Calculation

**Purpose:** Estimates inventory shortages and available stock.

It helps understand how long existing inventory can support production.

### 7.3 SLA Penalty Calculation

**Purpose:** Evaluates the potential impact of delayed customer orders against delivery commitments.

### 7.4 Constraint Validation

**Purpose:** Checks whether a proposed recovery plan is feasible.

It considers relevant constraints such as supplier availability, inventory, capacity and delivery requirements.

### 7.5 Multi-Criteria Scoring

**Purpose:** Compares recovery plans based on multiple business objectives.

Evaluation criteria include:

- Recovery cost.
- SLA performance.
- Recovery time.
- Customer impact.
- Operational risk.
- Sustainability.

### 7.6 Pareto Optimization

**Purpose:** Helps identify recovery plans offering better trade-offs between multiple objectives.

For example, one plan may be cheaper, while another may restore production faster.

---

## 8. How the System Works

The main workflow is:

1. A supply chain disruption is introduced.
2. The digital twin identifies affected dependencies.
3. The impact engine calculates inventory, production, order and SLA risks.
4. The recovery engine evaluates alternative recovery actions.
5. Constraint validation checks whether the proposed plans are feasible.
6. Scoring and optimization compare the available recovery options.
7. Gemini AI supports the explanation of recommendations.
8. A human decision-maker reviews and approves the selected plan.

---

## 9. Main Demonstration Scenario

### Scenario: Supplier S1 Failure

For the primary demonstration, Supplier S1 becomes unavailable for 14 days.

The system analyses the disruption and identifies the potential downstream impact.

It then evaluates recovery strategies such as:

- Finding an alternative supplier.
- Reallocating available inventory.
- Rescheduling production.
- Rerouting transportation.
- Prioritizing critical customer orders.

Multiple recovery options can be compared using cost, SLA performance, recovery time, customer impact, operational risk and sustainability.

### Surprise Scenario: Supplier S2 Failure

Before the first disruption is resolved, Supplier S2 also becomes unavailable.

The intended dynamic adaptation workflow is:

1. Detect the additional disruption.
2. Keep the original S1 disruption active.
3. Recalculate affected materials, factories, inventory and orders.
4. Revalidate existing recovery plans.
5. Generate updated recovery alternatives.
6. Explain what changed.
7. Request human approval again.

**Important:** The dynamic adaptation workflow should be demonstrated as implemented functionality only after it has been successfully tested in the prototype.

---

## 10. AI and Deterministic Computation

SupplyGuard AI combines generative AI with deterministic backend algorithms.

### Google Gemini AI

Gemini supports:

- Natural-language interaction.
- Reasoning support.
- Recommendation explanations.
- User-facing summaries.

### Deterministic Backend

The TypeScript backend handles:

- Numerical calculations.
- Dependency analysis.
- Inventory impact calculations.
- SLA calculations.
- Constraint validation.
- Recovery plan scoring and ranking.

**Important architectural principle:**

Gemini supports reasoning and explanations, while the deterministic backend is responsible for numerical calculations and feasibility checks.

---

## 11. Synthetic Dataset

The prototype inspection report describes the following baseline synthetic dataset:

| Entity | Number of Records |
|---|---:|
| Suppliers | 6 |
| Materials | 5 |
| Factories | 3 |
| Distribution Centres | 3 |
| Stores / Depots | 4 |
| Customer Orders | 12 |
| Transport Routes | 12 |
| **Total** | **45** |

The dataset is intended for demonstrating supply chain relationships and disruption scenarios.

### Dataset Source

The previously inspected project report identifies the dataset file as:

`src/server/database/synthetic-data.ts`

The reported dataset exports include:

- `INITIAL_SUPPLIERS`
- `INITIAL_MATERIALS`
- `INITIAL_FACTORIES`
- `INITIAL_DISTRIBUTION_CENTRES`
- `INITIAL_STORES`
- `INITIAL_ORDERS`
- `INITIAL_ROUTES`

**Data Disclaimer:** All demonstration records are synthetic. They do not represent actual company suppliers, inventory, orders or financial information.

---

## 12. Evaluation Metrics

SupplyGuard AI identifies the following metrics for evaluating its performance:

| Metric | Purpose |
|---|---|
| Disruption Detection Accuracy | Measures correct identification of disruptions. |
| Dependency Tracing Correctness | Measures whether affected dependencies are identified correctly. |
| Recovery Plan Feasibility | Measures whether proposed plans satisfy constraints. |
| Recovery Time | Measures the time required to restore operations in a scenario. |
| SLA Risk Reduction | Evaluates the effect of recovery plans on delivery commitments. |
| Task Success Rate | Measures successful completion of intended tasks. |
| Response Latency | Measures system response time. |
| AI Explanation Groundedness | Evaluates whether explanations are supported by available evidence. |

Actual evaluation scores should be added after testing. No unverified performance percentages are claimed here.

---

## 13. Responsible AI

SupplyGuard AI follows important responsible AI principles:

- Human approval before real-world execution.
- Clear separation of known information and assumptions.
- Avoiding unsupported supplier and inventory claims.
- Evidence-based recommendations.
- Explainable recovery decisions.
- Auditability of approval-related decisions.
- Safe handling of AI/API failures.

**Our principle: AI recommends. Humans approve.**

---

## 14. Current Prototype Scope and Limitations

The current prototype is a demonstration system based on synthetic data.

According to the project inspection report:

- The dataset is stored in memory.
- An external PostgreSQL database is not connected.
- Live ERP, SAP and Oracle integrations are not available.
- The supply chain network is predefined.
- Approval records do not automatically execute actual purchase orders.
- Simulation state may reset when the backend restarts.

These limitations are important when interpreting demonstration results.

---

## 15. Future Enhancements

Potential future improvements include:

1. PostgreSQL integration for persistent storage.
2. Real-time supplier and inventory data integration.
3. ERP integration with systems such as SAP and Oracle.
4. Advanced demand and disruption prediction.
5. More realistic factory capacity and transportation optimization.
6. Integration with approved procurement and logistics workflows.
7. Expanded supply chain networks and larger datasets.
8. Improved automated evaluation and benchmarking.

These are proposed enhancements, not claims about existing functionality.

---

## 16. Project Impact

SupplyGuard AI aims to help businesses achieve:

- Better supply chain visibility.
- Faster disruption analysis.
- More informed recovery decisions.
- Reduced customer and SLA risks.
- Better use of available inventory.
- Improved operational resilience.
- More transparent and explainable AI-assisted decisions.

---

## 17. Conclusion

Supply chain disruptions can affect an entire business, even when the original problem occurs at only one supplier.

SupplyGuard AI brings digital twin simulation, dependency analysis, deterministic optimization and AI-powered explanations together to support better recovery decisions.

By evaluating multiple recovery strategies and adapting to changing disruption scenarios, the project aims to help businesses build more resilient supply chains.

**SupplyGuard AI – Predict. Recover. Protect.**

---

## 18. Challenge Information

**Challenge:** Challenge 09 – Autonomous Supply Chain Digital Twin Recovery Agent  
**Theme:** Theme 2 – AI for Business  
**Domain:** Supply Chain Management  
**Project:** SupplyGuard AI

---

*This README describes the project concept, architecture, technologies and prototype scope based on the available project documentation. Features and performance should be represented as implemented only when verified in the running application.*
