export function validateParens(parens) {
  const tracking = [];
  for (let c of parens.split('')) {
    switch (c) {
      case '(':
        tracking.push(c);
        break;
      case ')':
        if (tracking.length === 0)
          return false;
        tracking.pop();
        break;
      default: continue;
    }
  }
  
  return tracking.length === 0;
}
