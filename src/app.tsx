import { MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import "./app.css";

import { createSignal, For, onCleanup, onMount } from "solid-js";


//■
function Clock(){
  const [time, setTime] = createSignal(new Date());
  onMount(() => {
    const interval = setInterval(() =>{
      setTime(new Date());
    }, 1000);
    onCleanup(() => clearInterval(interval));
  });
  return <div>{time().toLocaleTimeString()}</div>
}


export default function App() {
  const rows = 50;
  const cols = 100;
  
  const initialGrid = Array.from({ length: rows }, () =>
    Array.from({length: cols}, () => false));
  
  
  const [grid, setGrid] = createSignal<boolean[][]>(initialGrid);
  return (
    <Router
      root={props=>(
        <MetaProvider>
        <Title>Test</Title>
        <pre style={{"font-family":"monospace",
          "white-space":"pre",
          "line-height": "1em",
          "font-size":"16px"}}>
            <div>Current count: {Clock()} </div>
        <For each={grid()}>
          {row =>(
            <>
            {row.map(cell => (cell ? "■" : "0")).join("")}
            {"\n"}
            </>
          )}
        </For>
        </pre>
        </MetaProvider>
      )}>
    </Router>
  );
}