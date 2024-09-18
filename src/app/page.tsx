import axios from "axios";

const getTodo = async () => {
  const response = await axios.get("https://jsonplaceholder.typicode.com/todos/1");
  return response.data;
}

export default async function App() {
  const data = await getTodo();
  return <main>{JSON.stringify(data)}</main>;
}
