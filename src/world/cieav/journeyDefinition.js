export const consequenceScenario = {
  id: 'supplier-invoice-819',
  objective: 'Pay supplier invoice 819',
  proposal: 'Pay supplier',
  stage: 'CONSEQUENCE MATERIALIZATION',
  authority: 0,
  primary: {
    type: 'TRANSFER_VALUE',
    amount: 'USD 8,920',
    target: 'Supplier X',
    reason: 'Invoice 819',
  },
  canonicalReality: 'economic-transfer://company/supplier-x/invoice-819',
  secondaryEffects: ['Financial exposure +8,920', 'Supplier balance changes'],
  proofPlan: ['Bank API readback', 'Independent ledger evidence'],
  recovery: 'Compensation must be a new governed consequence.',
}

export const worldCopy = {
  outside: {
    eyebrow: 'COGNITIVE WORLD',
    title: 'Ideas can move freely.',
    copy: 'Models and agents may reason, research, and propose. Nothing here has execution authority yet.',
  },
  door: {
    eyebrow: 'INTEGRITY BOUNDARY',
    title: 'Consequence Building',
    copy: 'Enter to turn a vague proposal into trusted, machine-enforceable consequence semantics.',
  },
  inside: {
    eyebrow: 'TRUSTED SEMANTIC COMPILER',
    title: 'Materialize the consequence.',
    copy: 'The proposal becomes a canonical bundle with target, effects, proof requirements, and authority still fixed at zero.',
  },
}
