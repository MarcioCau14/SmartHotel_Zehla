# Graph Report - .  (2026-05-11)

## Corpus Check
- 6 files · ~1,000 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 34 nodes · 29 edges · 5 communities (4 shown, 1 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 3|Community 3]]

## God Nodes (most connected - your core abstractions)
1. `ZCCTab` - 1 edges
2. `TabConfig` - 1 edges
3. `ZCCCommunity` - 1 edges
4. `communities` - 1 edges
5. `tabs` - 1 edges
6. `AgentManagementPanel` - 1 edges
7. `SecurityPanel` - 1 edges
8. `TeamManagementTab` - 1 edges
9. `router` - 1 edges
10. `[isAdmin, setIsAdmin]` - 1 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Communities (5 total, 1 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.11
Nodes (16): [activeTab, setActiveTab], adminToken, AgentManagementPanel, [brainHealth, setBrainHealth], communities, [isAdmin, setIsAdmin], payload, router (+8 more)

### Community 1 - "Community 1"
Cohesion: 0.29
Nodes (3): Redis Singleton, ZCC Components Directory, zcc/page.tsx

## Knowledge Gaps
- **19 isolated node(s):** `ZCCTab`, `TabConfig`, `ZCCCommunity`, `communities`, `tabs` (+14 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What connects `ZCCTab`, `TabConfig`, `ZCCCommunity` to the rest of the system?**
  _19 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.11 - nodes in this community are weakly interconnected._