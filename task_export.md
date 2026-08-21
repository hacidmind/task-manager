# Virtual Card PM Hub — Task Export

---

## Daily Tasks

| ID | Title | Category | Status | Owner | Priority |
|----|-------|----------|--------|-------|----------|
| 1 | First Bank – Change PIN API (504 Gateway Timeout) | UAT Issue | Done | Kayode | High |
| 2 | Kuda Bank – Separation of Virtual & Physical Card Programs | Card Program | Done | Hafeez | Medium |
| 3 | UBA Onboarding – JWT Security & Docker Workaround | Onboarding | Ongoing | Hafeez / Engineering | High |
| 4 | Keystone Bank – AES GCM Encryption on UAT | Onboarding | Done | EFT Team | High |
| 5 | Password Bulk Error – Log Chunking Strategy | Engineering | Done | EFT Team | Medium |
| 6 | Union Bank – UAT Issues Resolved / FAQ Doc | UAT Issue | Done | Samuel / Hafeez | High |
| 7 | Globus Bank – FCI CMS API Onboarding | Onboarding | Ongoing | Hafeez | Low |
| 8 | API Marketplace – List Virtual Card API Endpoints | Engineering | Ongoing | Hafeez | Medium |
| 9 | Virtual Card Transaction Volume – DB Data Pull | Engineering | Waiting | Hafeez / Anthony Hungbo | High |
| 10 | UBA Virtual Card – HSM Prod Issue | UAT Issue | Done | Hafeez / Mikalum | High |
| 11 | Parallex Bank – BIN Lock Down on PostCard | Onboarding | Ongoing | Hafeez / Segun | Medium |
| 12 | VCM Periodic Audit File / Revenue Assurance | Engineering | Ongoing | Hafeez / EFT | High |
| 13 | First Bank – Deploy Bulk Error Log Fix | Engineering | Ongoing | Hafeez / EFT | High |
| 14 | Kuda Bank – BIN Separation Response & Config | Card Program | Ongoing | Hafeez | Medium |
| 15 | Dispute Management as a Service – Designer Engagement | Other | Ongoing | Hafeez | Medium |
| 16 | Purepay Product Catalogue – Input All Products | Other | Ongoing | Hafeez | Medium |
| 17 | BSC – Set Up KPIs and Goals for FY | Other | Ongoing | Hafeez | High |
| 18 | VCM SRE Issues (Ibrahim) – Scope for PI Backlog | Engineering | Ongoing | Hafeez | High |
| 19 | Palmpay – PIN Change API Down | UAT Issue | Ongoing | Hafeez | High |
| 20 | First Bank – Clarify Endpoint with Samuel | UAT Issue | Ongoing | Hafeez | Medium |

---

### Task Details

#### 1. First Bank – Change PIN API (504 Gateway Timeout)
- **Category:** UAT Issue | **Status:** Done | **Owner:** Kayode | **Priority:** High
- **Notes:** FBN getting 504 Gateway Timeout on Change PIN API on UAT. Kayode handled it.

---

#### 2. Kuda Bank – Separation of Virtual & Physical Card Programs
- **Category:** Card Program | **Status:** Ongoing | **Owner:** Hafeez | **Priority:** Medium
- **Notes:** Separate Kuda's virtual and physical card programs so each has a dedicated card programme and BIN.
- **Action Items:**
  - [ ] Confirm new BIN/programme requirements with Kuda
  - [ ] Engage Service Management to provision separate card programme
  - [ ] Validate separation on UAT before Prod

---

#### 3. UBA Onboarding – JWT Security & Docker Workaround
- **Category:** Onboarding | **Status:** Ongoing | **Owner:** Hafeez / Engineering | **Priority:** High
- **Notes:** Bank requires additional security — specifically JWT. Workaround: containerise the Virtual Card middleware using Docker and deploy within UBA's environment. Currently scoping feasibility with Engineering.
- **Action Items:**
  - [ ] Scope Docker containerisation feasibility with Engineering
  - [ ] Define JWT workaround approach and document
  - [ ] Present proposed solution to UBA

---

#### 4. Keystone Bank – AES GCM Encryption on UAT
- **Category:** Onboarding | **Status:** Done | **Owner:** EFT Team | **Priority:** High
- **Notes:** New build had errors on UAT. EFT used the AES GCM tool to encrypt/decrypt the password. Resolved.

---

#### 5. Password Bulk Error – Log Chunking Strategy
- **Category:** Engineering | **Status:** Done | **Owner:** EFT Team | **Priority:** Medium
- **Notes:** Chunking strategy to split large log files. Tested by EFT and deployed.
- **Action Items:**
  - [x] Send email to EFT with build attached
  - [x] EFT to test on First Bank (Priority)
  - [x] Deploy to production

---

#### 6. Union Bank – UAT Issues Resolved / FAQ Doc
- **Category:** UAT Issue | **Status:** Done | **Owner:** Samuel / Hafeez | **Priority:** High
- **Notes:** UAT asks addressed. Learnings to be documented as FAQ — appended to API doc or standalone.
- **Action Items:**
  - [x] Implement validation to prevent duplicate VC creation
  - [x] Encrypt virtual card records on pc_cards
  - [x] Ensure account records created on pc_accounts where absent
  - [ ] Create FAQ doc from UAT learnings

---

#### 7. Globus Bank – FCI CMS API Onboarding
- **Category:** Onboarding | **Status:** Ongoing | **Owner:** Hafeez | **Priority:** Low
- **Notes:** Onboarding going smoothly. Monitor and support as needed.

---

#### 8. API Marketplace – List Virtual Card API Endpoints
- **Category:** Engineering | **Status:** Ongoing | **Owner:** Hafeez | **Priority:** Medium
- **Notes:** Define and document all Virtual Card API endpoints for the API Marketplace. Full card lifecycle surface — creation, activation, freeze/unfreeze, block, limits, metadata.
- **Action Items:**
  - [ ] Audit all existing Virtual Card middleware API endpoints
  - [ ] Determine which endpoints are marketplace-ready
  - [ ] Document specs — request/response, auth, error codes
  - [ ] Review and sign off with Engineering

---

#### 9. Virtual Card Transaction Volume – DB Data Pull
- **Category:** Engineering | **Status:** Waiting | **Owner:** Hafeez / Anthony Hungbo | **Priority:** High
- **Notes:** Speak with Anthony Hungbo to spool transaction volume data from DB per virtual card customer and card programme.
- **Action Items:**
  - [ ] Compile list of virtual card customers and their card programmes
  - [ ] Schedule discussion with Anthony Hungbo
  - [ ] Anthony to spool transaction volume data per customer from DB
  - [ ] Review and analyse the data

---

#### 10. UBA Virtual Card – HSM Prod Issue
- **Category:** UAT Issue | **Status:** Done | **Owner:** Hafeez / Mikalum | **Priority:** High
- **Notes:** HSM was working on Test but not Prod. Logged on Jira. Resolved.
- **Action Items:**
  - [x] Log issue on Jira as requested by Mikalum
  - [x] Investigate HSM config difference between Test and Prod
  - [x] Engage EFT / Infra team to resolve Prod HSM issue

---

#### 11. Parallex Bank – BIN Lock Down on PostCard
- **Category:** Onboarding | **Status:** Ongoing | **Owner:** Hafeez / Segun | **Priority:** Medium
- **Notes:** Session required with Segun (Parallex Bank) on BIN lock down configuration on PostCard. Parallex onboarding for Mastercard.
- **Action Items:**
  - [ ] Schedule session with Segun (Parallex Bank)
  - [ ] Discuss and agree BIN lock down approach on PostCard
  - [ ] Confirm configuration and proceed

---

#### 12. VCM Periodic Audit File / Revenue Assurance
- **Category:** Engineering | **Status:** Ongoing | **Owner:** Hafeez / EFT | **Priority:** High
- **Notes:** Track card issuance data from on-premise bank deployments via a proprietary ISW-only readable file. EFT conducts scheduled on-site visits, pulls the file, reconciles cards issued against billing records, invoices accordingly. File contains card creation events logged via VCM Create Card endpoint. Quarterly cadence. SLA and licensing/maintenance fee structure to be formalised.
- **Action Items:**
  - [ ] Define proprietary file format spec
  - [ ] Establish SLA for EFT on-site visit frequency and data delivery
  - [ ] Formalise licensing and maintenance fee structure
  - [ ] Run first reconciliation cycle across on-premise banks

---

#### 13. First Bank – Deploy Bulk Error Log Fix
- **Category:** Engineering | **Status:** Ongoing | **Owner:** Hafeez / EFT | **Priority:** High — IMPORTANT
- **Notes:** First Bank ready for deployment of the bulk error log fix. Liaise with EFT to deploy on First Bank's environment.
- **Action Items:**
  - [ ] Liaise with EFT to schedule deployment
  - [ ] Deploy bulk error log fix on First Bank environment
  - [ ] Confirm fix is working post-deployment

---

#### 14. Kuda Bank – BIN Separation Response & Config
- **Category:** Card Program | **Status:** Ongoing | **Owner:** Hafeez | **Priority:** Medium
- **Notes:** Kuda responded on implications of BIN separation. Confirmed to Kuda: no negative effect. Proposed change introduces a separate BIN range/card programme for Virtual Card going forward — clear distinction between Virtual and Physical Card portfolios. New virtual cards issued under dedicated virtual card BIN/programme. Existing cards on old BINs continue to operate until expiry.
- **Action Items:**
  - [ ] Confirm new BIN range provisioning with Service Management
  - [ ] Implement new virtual card BIN/programme configuration
  - [ ] Validate new cards issue under new BIN on UAT

---

#### 15. Dispute Management as a Service (DMaaS) – Designer Engagement
- **Category:** Other | **Status:** Ongoing | **Owner:** Hafeez | **Priority:** Medium
- **Notes:** Reach out to Atinu Odenuga (Head of UI/UX) to assign a designer for DMaaS. DMaaS is a local dispute management aggregator platform that automates and simplifies the entire dispute lifecycle — from intake to resolution — connecting issuers, acquirers, and merchants for international card scheme transactions (Visa, Mastercard, Amex) through a single interface (the Mediator).
- **Action Items:**
  - [ ] Reach out to Atinu Odenuga to request designer resource
  - [ ] Brief designer on DMaaS scope and UX requirements

---

#### 16. Purepay Product Catalogue – Input All Products
- **Category:** Other | **Status:** Ongoing | **Owner:** Hafeez | **Priority:** Medium
- **Notes:** Input all Purepay products into the Purepay Product Catalogue Sheet. Ensure all active products are accurately represented.
- **Action Items:**
  - [ ] Gather full list of Purepay products
  - [ ] Input all products into the Product Catalogue Sheet
  - [ ] Review for completeness and accuracy

---

#### 17. BSC – Set Up KPIs and Goals for FY
- **Category:** Other | **Status:** Ongoing | **Owner:** Hafeez | **Priority:** High
- **Notes:** Set up Balanced Scorecard KPIs and goals for the financial year. Define measurable targets aligned to product and business objectives.
- **Action Items:**
  - [ ] Draft KPIs and goals aligned to FY objectives
  - [ ] Submit and get sign-off from line manager

---

#### 18. VCM SRE Issues (Ibrahim) – Scope for PI Backlog
- **Category:** Engineering | **Status:** Ongoing | **Owner:** Hafeez | **Priority:** High — IMPORTANT
- **Notes:** Virtual Card Middleware issues raised by Ibrahim from SRE. Must be scoped and added to the product backlog for the upcoming PI planning session.
- **Action Items:**
  - [ ] Collect and review all issues raised by Ibrahim (SRE)
  - [ ] Scope each issue — severity, effort, dependency
  - [ ] Add scoped items to PI backlog

---

#### 19. Palmpay – PIN Change API Down
- **Category:** UAT Issue | **Status:** Ongoing | **Owner:** Hafeez | **Priority:** High
- **Notes:** Palmpay reporting PIN Change API is down. The following details are required from Palmpay to investigate from ISW end: (1) Correlation ID, (2) Timestamps of failing requests, (3) Payload and error response received.
- **Action Items:**
  - [ ] Request Correlation ID from Palmpay
  - [ ] Request timestamps of failing requests from Palmpay
  - [ ] Request payload and error response from Palmpay
  - [ ] Investigate from ISW end once details received

---

#### 20. First Bank – Clarify Endpoint with Samuel
- **Category:** UAT Issue | **Status:** Ongoing | **Owner:** Hafeez | **Priority:** Medium
- **Notes:** Follow up with Samuel to clarify the specific endpoint in question for First Bank.
- **Action Items:**
  - [ ] Ask Samuel about the endpoint

---

## FY27 Roadmap

| ID | Title | Category | Quarter | Status | Owner | Priority |
|----|-------|----------|---------|--------|-------|----------|
| 101 | Virtual Card Security Architecture Overhaul | Security | Q1 FY27 | Planned | Hafeez / Sam | High |
| 102 | Unified Build – Consolidate Virtual Card Middleware Versions | Engineering | Q2 FY27 | Planned | Hafeez / EFT | High |
| 103 | Mastercard GCO Reporting Dashboard | Reporting | Q2 FY27 | Planned | Hafeez | Medium |
| 104 | Virtual-to-Physical Card Upgrade | Product Expansion | Q2 FY27 | Planned | Hafeez | High |
| 105 | Dynamic CVV for Enhanced Security | Security | Q3 FY27 | Planned | Hafeez | High |
| 106 | Product Website Landing Page | Go-to-Market | Q1 FY27 | Planned | Hafeez | Medium |
| 107 | Virtual Card Tokenization | Security | Q3 FY27 | Planned | Hafeez | High |
| 108 | Virtual Card Reporting Dashboard (ASPFEP Customers) | Reporting | Q1 FY27 | Ongoing | Hafeez / Data Team | Medium |

---

### FY27 Initiative Details

#### 101. Virtual Card Security Architecture Overhaul
- **Category:** Security | **Quarter:** Q1 FY27 | **Status:** Planned | **Owner:** Hafeez / Sam | **Priority:** High
- **Notes:** Define and implement a robust security architecture for the Virtual Card middleware. Scope covers encryption standards, token security, API authentication, and compliance alignment with PCI-DSS and CBN guidelines.

---

#### 102. Unified Build – Consolidate Virtual Card Middleware Versions
- **Category:** Engineering | **Quarter:** Q2 FY27 | **Status:** Planned | **Owner:** Hafeez / EFT | **Priority:** High
- **Notes:** Reduce multiple coexisting builds of the Virtual Card middleware into a single, versioned build. Eliminates deployment inconsistencies, reduces maintenance overhead, simplifies onboarding for new banks.

---

#### 103. Mastercard GCO Reporting Dashboard
- **Category:** Reporting | **Quarter:** Q2 FY27 | **Status:** Planned | **Owner:** Hafeez | **Priority:** Medium
- **Notes:** Reporting dashboard for Mastercard Global Clearing Operations (GCO) requirements. Surfaces key scheme compliance metrics and data required for Mastercard submissions.

---

#### 104. Virtual-to-Physical Card Upgrade
- **Category:** Product Expansion | **Quarter:** Q2 FY27 | **Status:** Planned | **Owner:** Hafeez | **Priority:** High
- **Notes:** Virtual-first issuance model — customers begin with instant virtual cards and later materialise the same card as a physical instrument. Requires tight FCI CMS Portal integration for single PAN lifecycle, continuity of controls, and seamless virtual-to-physical fulfillment.

---

#### 105. Dynamic CVV for Enhanced Security
- **Category:** Security | **Quarter:** Q3 FY27 | **Status:** Planned | **Owner:** Hafeez | **Priority:** High
- **Notes:** Dynamic CVV makes card details time-bound and less reusable. Opt-in feature, customers billed based on preference. Reduces fraud exposure for issuers.

---

#### 106. Product Website Landing Page
- **Category:** Go-to-Market | **Quarter:** Q1 FY27 | **Status:** Planned | **Owner:** Hafeez | **Priority:** Medium
- **Notes:** Dedicated landing page communicating the product as a card issuance and management platform. Covers lifecycle ownership, security controls, virtual-to-physical readiness, and API-first design. Goal: qualification and clarity, not marketing.

---

#### 107. Virtual Card Tokenization
- **Category:** Security | **Quarter:** Q3 FY27 | **Status:** Planned | **Owner:** Hafeez | **Priority:** High
- **Notes:** Tokenize virtual card credentials, replacing static PANs with network tokens. Aligns with Visa Token Service / Mastercard MDES. Reduces PAN exposure across the card lifecycle.

---

#### 108. Virtual Card Reporting Dashboard (ASPFEP Customers)
- **Category:** Reporting | **Quarter:** Q1 FY27 | **Status:** Ongoing | **Owner:** Hafeez / Data Team | **Priority:** Medium
- **Notes:** Power BI dashboard tracking virtual cards issued by Multitenancy (ASPFEP) customers. Already logged with the Data Team.
- **Action Items:**
  - [ ] Data Team to scope data model and sources
  - [ ] Define key metrics — cards issued per customer, trends, active vs inactive
  - [ ] Review and sign off on dashboard design
  - [ ] UAT and deployment

---

## Quarterly Task Manager
> Placeholder — to be built out on request.

---

## Notes for Codex
- Daily Tasks seed array: `DAILY_TASKS` (ids 1–20)
- FY27 seed array: `FY27_TASKS` (ids 101–108)
- Next auto-generated ID starts at `200` (`let _nextId = 200`)
- Status options — Daily: `Ongoing | Waiting | Done | Blocked`
- Status options — FY27: `Planned | Not Started | Ongoing | Done | Blocked`
- Priority options: `High | Medium | Low`
- Priority flags — High: red `#EF4444` | Medium: amber `#F59E0B` | Low: green `#10B981`
- FY27 quarters: `Q1 FY27 | Q2 FY27 | Q3 FY27 | Q4 FY27`
- Daily categories: `UAT Issue | Onboarding | Card Program | Engineering | Other`
- FY27 categories: `Security | Engineering | Reporting | Product Expansion | Go-to-Market | Strategy | Other`
