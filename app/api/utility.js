async function fetchStream(stream) {
  const reader = stream.getReader();
  let textDecoder = new TextDecoder();
  let result = "";
  let tmp = await reader.read();
  result = result + textDecoder.decode(tmp.value);
  while (!tmp.done) {
    tmp = await reader.read();
    result = result + textDecoder.decode(tmp.value);
  }
  return result;
}

function getFilters(filters_header) {
  let filters = {};
  for (let [key, value] of Object.entries(filters_header)) {
    if (key === "General Reactivity" && value.length !== 0) {
      filters["general_reactivity"] = value;
    }
    if (key === "Stereoselectivity" && value.length !== 0) {
      filters["stereoselectivity"] = value;
    }
    if (key === "Methodology class" && value.length !== 0) {
      filters["methodology_class"] = value;
    }
    if (key === "Green chemistry" && value !== "") {
      filters["green_chemistry"] = value;
    }
    if (key === "Year of publication" && value !== "") {
      filters["year_of_publication"] = value;
    }
    if (key === "reaction_name" && value !== "") {
      filters["reaction_name"] = value;
    }
  }
  return filters;
}

export { fetchStream, getFilters };