import { MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import "./app.css";

import { createSignal, For, onCleanup, onMount, createEffect } from "solid-js";


//■
function Life(){
  const rows = 50;
  const cols = 100;
  
  const initialGrid = Array.from({ length: rows }, () =>
    Array.from({length: cols}, () => false));

  const [grid, setGrid] = createSignal<boolean[][]>(initialGrid);

  //const [seconds, setSeconds] = createSignal(new Date().getSeconds());
  onMount(() => {
    const interval = setInterval(() =>{
      const nextGrid = grid().map(row => [...row])
      nextGrid[25][50] = !nextGrid[25][50];

      setGrid(nextGrid);
    }, 1000);
    onCleanup(() => clearInterval(interval));
  });
  
    return (
          <pre style={{"font-family":"monospace",
            "white-space":"pre",
            "line-height": "1em",
            "font-size":"16px"}}>
          <For each={grid()}>
            {row =>(
              <>
              {row.map(cell => (cell ? "■" : "0")).join("")}
              {"\n"}
              </>
            )}
          </For>
          </pre>
    );
}


export default function App() {
  return (
    <Router
    root={(props) => (
      <MetaProvider>
      <Title>Test</Title>
      <Life />
      </MetaProvider>
    )}
    >
      <FileRoutes />
    </Router>
  );
}