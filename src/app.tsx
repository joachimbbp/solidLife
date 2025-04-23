import { MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import "./app.css";

import { createSignal, For, onCleanup, onMount, createEffect } from "solid-js";




//■

function applyRules(grid: boolean[][], row: number, col: number): boolean{
  let neighbors = 0;
  //(I think I might have inverted this compass terminology, just heads up!)
  //North
  if (grid[row][col+1]){neighbors += 1}
  //North East
  if (grid[row+1][col+1]){neighbors += 1}
  //East
  if (grid[row+1][col]){neighbors += 1}
  //South East
  if (grid[row+1][col-1]){neighbors +=1}
  //South
  if(grid[row][col-1]){neighbors +=1}
  //South West
  if(grid[row-1][col-1]){neighbors+=1}
  //West
  if(grid[row-1][col]){neighbors+=1}
  //North West
  if(grid[row-1][col+1]){neighbors+=1}

  // Any live cell with fewer than two live neighbors dies, as if by under-population.
  if (grid[row][col] && neighbors < 2){return false}
  // Any live cell with two or three live neighbors lives on to the next generation.
  if (grid[row][col] && (neighbors===2 || neighbors ===3)){return true}
  // Any live cell with more than three live neighbors dies, as if by overpopulation.
  if((grid[row][col]) && (neighbors >= 3)){return false}
  // Any dead cell with exactly three live neighbors becomes a live cell, as if by reproduction.
  if(!grid[row][col] && (neighbors===3)){return true}

  //I don't think we have any undefined behavior, but just incase, kill it?
  return false
}



function Life(){
  const rows = 70;
  const cols = 120;
  
  const initialGrid = Array.from({ length: rows }, () =>
    Array.from({length: cols}, () => Math.random() < 0.1));

  const [grid, setGrid] = createSignal<boolean[][]>(initialGrid);

  //const [seconds, setSeconds] = createSignal(new Date().getSeconds());
  onMount(() => {
    const interval = setInterval(() =>{
      const nextGrid = grid().map(row => [...row])
     
      for (let row = 0; row < nextGrid.length; row++){
        for (let col=0; col<nextGrid[row].length; col++){
          if (row>=1 && row<rows-1 && col>=1 && col<cols-1){
            nextGrid[row][col] = applyRules(nextGrid, row, col)         
          }else{
            nextGrid[row][col]=false;
          }
        }
      }

      setGrid(nextGrid);



    }, 200);
    onCleanup(() => clearInterval(interval));
  });
  
    return (
          <pre style={{"font-family":"monospace",
            "white-space":"pre",
            "line-height": "0.5em",
            "font-size":"16px"}}>
          <For each={grid()}>
            {row =>(
              <>
              {row.map(cell => (cell ? "■" : " ")).join("")}
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