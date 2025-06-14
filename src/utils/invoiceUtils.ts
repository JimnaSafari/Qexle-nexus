
export const VAT_RATE = 0.16; // 16% VAT

export const calculateVAT = (amount: number) => {
  return amount * VAT_RATE;
};

export const calculateTotal = (amount: number) => {
  return amount + calculateVAT(amount);
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'Paid': return 'bg-mna-success text-white';
    case 'Pending': return 'bg-mna-accent text-mna-primary';
    case 'Overdue': return 'bg-mna-danger text-white';
    case 'Draft': return 'bg-mna-secondary text-mna-primary';
    default: return 'bg-mna-secondary text-mna-primary';
  }
};
