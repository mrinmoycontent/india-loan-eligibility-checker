export const access = "public";
export const methods = ["POST"];

const sigmoid = z => 1 / (1 + Math.exp(-Math.max(-30, Math.min(30, z))));

// Fixed coefficients for an experimental historical-dataset portfolio estimate.
// The original Colab model artifact is not integrated; no validated performance metrics
// or calibrated approval probability are claimed for this deployed demo.
function modelProbability(income, amountRupees, months) {
  const x = [1, Math.log1p(Math.max(0, income)) / 10,
    Math.log1p(Math.max(0, amountRupees / 1000)) / 7, months / 360];
  const w = [1.0815859946944995, 0.6785001396610033, -1.1009729567113498, -0.20116930840711744];
  return sigmoid(w.reduce((sum, value, i) => sum + value * x[i], 0));
}

export default async function(req, res) {
  const b = req.body || {};
  const income = Number(b.income), existing = Number(b.existingEmi);
  const amount = Number(b.amount), years = Number(b.tenureYears);
  if (!b.loanType || !b.bank || ![income, existing, amount, years].every(Number.isFinite) ||
      income <= 0 || existing < 0 || amount < 1000 || years <= 0) {
    return res.status(400).json({ error: "Enter valid monthly income, existing EMIs, requested loan amount and repayment period." });
  }
  const products = {
    "Home Loan|SBI": {max:30,rate:.085}, "Home Loan|HDFC Bank": {max:30,rate:.087},
    "Home Loan|ICICI Bank": {max:30,rate:.0875}, "Home Loan|Axis Bank": {max:30,rate:.088},
    "Home Loan|Bank of Baroda": {max:30,rate:.0865}, "Home Loan|Punjab National Bank": {max:30,rate:.086},
    "Personal Loan|SBI": {max:7,rate:.13}, "Personal Loan|HDFC Bank": {max:5,rate:.11},
    "Personal Loan|ICICI Bank": {max:6,rate:.11}, "Personal Loan|Axis Bank": {max:5,rate:.12},
    "Personal Loan|Kotak Mahindra Bank": {max:5,rate:.11},
    "Vehicle Loan|SBI": {max:7,rate:.10}, "Vehicle Loan|HDFC Bank": {max:7,rate:.095},
    "Vehicle Loan|ICICI Bank": {max:7,rate:.10}, "Vehicle Loan|Axis Bank": {max:7,rate:.10},
    "Vehicle Loan|Bank of Baroda": {max:7,rate:.095},
    "Business Loan|SBI": {max:7,rate:.12}, "Business Loan|HDFC Bank": {max:7,rate:.14},
    "Business Loan|ICICI Bank": {max:7,rate:.14}, "Business Loan|Axis Bank": {max:7,rate:.15},
    "Business Loan|Bank of Baroda": {max:7,rate:.13}
  };
  const p = products[b.loanType + "|" + b.bank];
  if (!p) return res.status(400).json({error:"Choose a supported loan type."});
  if (years > p.max) return res.status(400).json({error:"Choose a repayment period of no more than " + p.max + " years for this product."});
  if (b.loanType === "Business Loan" && amount > 1000000)
    return res.status(400).json({error:"The SBI business-loan estimate is limited to ₹10 lakh for this demo."});

  const months = years * 12, r = p.rate / 12;
  const emi = amount * r * Math.pow(1+r,months) / (Math.pow(1+r,months)-1);
  const available = Math.max(0, income*.5-existing), total = existing+emi;
  const ratio = total/income*100, fits = emi <= available;
  const money = n => "₹" + Math.round(n).toLocaleString("en-IN");
  let band;
  if (ratio > 50) band = "HIGH EMI BURDEN — exceeds the 50% guideline";
  else if (ratio > 40) band = "STRETCHED — 40–50% of income goes to EMIs";
  else if (ratio > 30) band = "MODERATE — 30–40% of income goes to EMIs";
  else band = "LOWER EMI BURDEN — no more than 30% of income goes to EMIs";

  const probability = modelProbability(income, amount, months);
  const prediction = probability >= .5 ? "Model leans toward approval" : "Model leans toward rejection";
  const result = "EXPERIMENTAL ML ESTIMATE (historical practice dataset)\nModel output: " + prediction +
    "\nEstimated model score: " + (probability*100).toFixed(1) +
    "%\nInputs used by this model: monthly income, requested loan amount and tenure." +
    "\nThis is a limited portfolio-demo model, not the original Colab artifact, a calibrated bank approval probability, or a lender decision." +
    "\n\nBANK-SPECIFIC EMI SCREEN\nSelected bank: " + b.bank +
    "\nIllustrative rate for this bank/product: " + (p.rate*100).toFixed(2) + "% p.a." +
    "\nAffordability assessment: " + band +
    "\nThe selected bank's illustrative rate affects the EMI and affordability result, not the ML score." +
    "\n\n" + (fits ? "AFFORDABILITY CHECK\nYour existing EMIs plus the estimated new loan EMI are within the app’s simple 50% take-home-income guideline. This does not guarantee loan approval."
      : "AFFORDABILITY WARNING\nYour existing EMIs plus the estimated new loan EMI exceed the app’s simple 50% take-home-income guideline. Consider a lower loan amount or a longer term, if the bank allows it.") +
    "\n\nEMI & AFFORDABILITY CHECK\nRequested loan: " + money(amount) +
    "\nMonthly take-home income: " + money(income) + "\nExisting monthly EMIs: " + money(existing) +
    "\nEstimated new loan EMI: " + money(emi) + "\nTotal monthly EMIs after this loan: " + money(total) +
    "\nIncome used for EMIs: " + ratio.toFixed(1) + "%" +
    "\nAffordability guide: " + (fits?"Within":"Above") + " the simple 50% take-home-income guide (available EMI: " + money(available) + ")." +
    "\n\nRates shown are illustrative, not live bank quotes. Neither result is a loan approval decision.";
  return res.json({result, prediction, approvalProbability:Math.round(probability*1000)/10,
    affordabilityBand:band, estimatedEmi:Math.round(emi), availableEmi:Math.round(available),
    affordabilityFits:fits, model:"experimental-logistic-regression-3-feature-plus-bank-specific-emi-screen"});
}
