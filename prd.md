# Product Requirements Document (PRD)

## Front-End Firebase Integration — Final Schema Mapping

_Connect the front-end UI to Firestore and render **live pricing data** using
the specific field mappings defined below._

---

## 2 · Front-End Views

### 🔍 A. SKU Search Page

| UI Label       | Firestore Field       | Notes                        |
|----------------|------------------------|-------------------------------|
| **SKU**        | `ProductCode`          | document ID prefix           |
| **Description**| `Description1`         | human-readable name          |
| **Category**   | _(hardcoded "Beef")_   | not stored yet               |
| **Storage**    | `WarehouseCode`        | `1` = Fresh, `2` = Frozen    |
| **AI Price**   | `Computed_Price`       | Recommended price            |
| **GP%**        | `Recommended_Margin`   | Model-selected GP%           |
| **Inventory**  | `InventoryLbs`         | Total inventory in lbs       |

---

### 🔎 B. SKU Details Page

| UI Label                  | Firestore Field         | Notes                    |
|---------------------------|--------------------------|---------------------------|
| **AI Recommended Price**  | `Computed_Price`         | Main price badge         |
| **Margin**                | `Recommended_Margin`     | Model target margin      |
| **Why this price**        | _(leave blank for now)_  | `rationale` not present yet |
| **LastCost**              | `LastCost`               | Internal cost            |
| **Benchmark Price**       | `EvalSalesPrice`         | System benchmark         |
| **RecentGP**              | `Recent_GPPercent`       | Last 4-week GP%          |
| **LifetimeGP**            | `Historical_GPPercent`   | All-time GP%             |
| **MedianGP**              | `GPMedian`               | From margin corridor     |
| **Inventory**             | `InventoryLbs`           | On-hand lbs              |
| **Weeks on Hand**         | `WeeksOnHand`            | Inventory ÷ avg volume   |
| **USDA Today**            | _(leave blank)_          | Not yet included         |
| **7 Day**                 | _(leave blank)_          |                          |
| **30v90**                 | _(leave blank)_          |                          |
| **1 Year**                | _(leave blank)_          |                          |

---

## 3 · Tasks (Frontend)

| Step | Task |
|------|------|
| 1    | Replace all mock/sample objects with Firestore reads (`getDocs` on `evals`) |
| 2    | Apply above mappings when displaying list or card data |
| 3    | Where values are marked “missing” above, pass empty string or `null` |
| 4    | Normalize Storage value: `1 → Fresh`, `2 → Frozen` |
| 5    | Add fallback for any missing numeric fields (e.g., display “—” if undefined) |

---

## 4 · Tasks (Backend/Support)

| Step | Task |
|------|------|
| 1    | Ensure fields above are present in the `evaluation_*.csv` before upload |
| 2    | Push those fields into Firebase with `firebase/push_evals.py` |
| 3    | Do not include fields not listed above; omit rationale for now |

---

## 5 · Future Enhancements (Not Required Now)

- Add `rationale: List[str]` to Firestore for “Why this price?”  
- Add USDA fields (`USDA_Today`, `7_Day`, etc.) from the demand module  
- Add `Category` explicitly (from SKU metadata or by rule)

---

**End of PRD**