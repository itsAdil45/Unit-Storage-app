

export const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

 export   const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'completed': return '#2196F3';
      case 'cancelled': return '#FF5722';
      case 'paid': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'available': return '#4CAF50';
      case 'occupied': return '#2196F3';
      case 'maintenance': return '#FF9800';
      case 'overdue': return '#FF5722';
      default: return "#777";
    }
  };

  export  const formatAEDCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `AED ${num.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

export const formatCurrency = (amount: number | string) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return num;
};
