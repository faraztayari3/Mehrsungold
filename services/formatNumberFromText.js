const FormatNumberFromText = (text) => {
  const numberMatch = text.match(/\d+/);

  if (numberMatch) {
    const number = Number(numberMatch[0], 10);
    const formattedNumber = number?.toLocaleString('en-US', { maximumFractionDigits: 3 });

    return text?.replace(numberMatch[0], formattedNumber);
  } else {
    return text;
  }
}

export default FormatNumberFromText;