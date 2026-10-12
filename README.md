# India Loan Eligibility Checker

**Live Hatchable demo:** https://india-loan.hatchable.site  

A portfolio prototype combining an experimental ML-style estimate with a separate bank-specific EMI calculator and affordability screen.

## Features
- Home, Personal, Vehicle, and Business loan categories.
- Multiple bank choices and illustrative rates per category.
- EMI calculation using the selected rate.
- Existing EMI and monthly income burden calculations.
- A simple 50% take-home-income affordability guideline.
- Separate experimental score and affordability assessment.

## Files
```text
public/index.html   Frontend interface
api/screen.js       Hatchable API endpoint
README.md           Project overview and interview notes
.gitignore          Common local-only files to exclude
```

## How it works
The experimental score uses monthly income, requested loan amount, and tenure. It uses a fixed logistic-style function with hard-coded coefficients. The original trained model artifact from the Colab notebook is **not integrated**, and this score is not a validated or calibrated probability of loan approval. No validated model performance metrics are claimed.

EMI is calculated using the standard reducing-balance formula:

`EMI = P × r × (1 + r)^n / ((1 + r)^n − 1)`

`P` is principal, `r` is monthly interest rate, and `n` is the number of monthly instalments.

Affordability adds existing EMIs to the new EMI and compares the total against monthly take-home income. The app uses a simple 50% guideline and labels EMI burden in bands. These are simplified budgeting guidelines, not official bank criteria.

## Illustrative annual rates

| Loan type | Bank | Rate |
|---|---|---:|
| Home | SBI | 8.50% |
| Home | HDFC Bank | 8.70% |
| Home | ICICI Bank | 8.75% |
| Home | Axis Bank | 8.80% |
| Home | Bank of Baroda | 8.65% |
| Home | Punjab National Bank | 8.60% |
| Personal | SBI | 13.00% |
| Personal | HDFC Bank | 11.00% |
| Personal | ICICI Bank | 11.00% |
| Personal | Axis Bank | 12.00% |
| Personal | Kotak Mahindra Bank | 11.00% |
| Vehicle | SBI | 10.00% |
| Vehicle | HDFC Bank | 9.50% |
| Vehicle | ICICI Bank | 10.00% |
| Vehicle | Axis Bank | 10.00% |
| Vehicle | Bank of Baroda | 9.50% |
| Business | SBI | 12.00% |
| Business | HDFC Bank | 14.00% |
| Business | ICICI Bank | 14.00% |
| Business | Axis Bank | 15.00% |
| Business | Bank of Baroda | 13.00% |

Rates are illustrative, not verified live bank offers.

## Example
For ₹1,00,000 at 8.80% annually over five years, estimated EMI is approximately ₹2,066. At ₹90,000 monthly take-home income and no existing EMIs, the income burden is approximately 2.3%.

## Deployment note
This is a source snapshot of the Hatchable-hosted project. `api/screen.js` uses Hatchable's endpoint contract (`export const access`, `export const methods`, and the `req`/`res` handler). It is not a standalone Express server without adaptation. To keep using Hatchable, open the project console linked above. To deploy elsewhere, adapt the API handler and configure the frontend endpoint for that platform.

## Limitations
- The original Colab model artifact is not integrated.
- The score is not a validated/calibrated approval probability.
- No validated accuracy, precision, recall, or other model metrics are claimed.
- Interest rates are illustrative, not live.
- Affordability rules are simplified.
- Actual lenders may consider credit history, employment, documents, debt obligations, and lender-specific rules.
- This app does not approve, reject, or guarantee a loan.

## Interview talking points
- **Why separate ML scoring and affordability?** They answer different questions: an experimental score versus estimated repayment burden.
- **How is EMI calculated?** Using the standard reducing-balance EMI formula.
- **Does a 75% score mean a 75% chance of approval?** No; it is not calibrated or validated.
- **Is the original Colab model integrated?** No; this version uses a fixed experimental three-input logistic-style function.
- **What would improve it?** Integrate and evaluate the trained model on held-out data, document metrics, calibrate outputs where appropriate, verify bank rates, and add automated tests and security/privacy controls.

## Disclaimer
For educational and portfolio demonstration only. Not financial advice, a lender underwriting tool, or a guarantee of eligibility. Rates are illustrative and the experimental score is not a validated loan approval probability.
