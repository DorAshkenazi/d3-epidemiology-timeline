import React from "react";
import styles from "./App.module.css";
import { Graph } from "./Graph/graph";
import { CaseNode, RawEdge, RawNode } from "./listToGraph/interfaces";
import rawNodes from "./listToGraph/nodes_new.json";
import rawEdges from "./listToGraph/edges_new.json";
import { useFetch } from "react-async";
import { useDebounce } from "./utils";

import "@fortawesome/fontawesome-free/css/all.css";

if (window.location.search.includes("specialOps")) {
  window.localStorage.setItem("specialOps", "true");
}

async function readJSONFile<T = any>(file: File): Promise<T> {
  return JSON.parse(await file.text());
}

function App() {
  const [backendBaseURL, setBackendURL] = React.useState<string>("");
  const [nodesFromFile, setNodesFromFile] = React.useState<RawNode[]>();
  const [edgesFromFile, setEdgesFromFile] = React.useState<RawEdge[]>();
  const backendBaseURLDebounced = useDebounce(backendBaseURL, 300);

  const { data: graphNodesFromServer } = useFetch<RawNode[]>(
    `${backendBaseURLDebounced}/api/graph_nodes`,
    {},
    { json: true }
  );
  const { data: graphEdgesFromServer } = useFetch<RawEdge[]>(
    `${backendBaseURLDebounced}/api/graph_edges`,
    {},
    { json: true }
  );

  const edgeHoverTooltip = React.useCallback(
    (node: CaseNode, parent?: CaseNode) =>
      `${parent?.name} -> ${node.name}(id:${node.id})`,
    []
  );

  const nodeHoverTooltip = React.useCallback((node, parent) => {
    return `<div>
      ${node.id}<br />
      ${node.name}<br />
      ${node.gender}<br />
      ${node.date}<br />
      ${node.status}<br />
    </div>`;
  }, []);

  const dataSetToUse = React.useMemo(() => {
    if (graphNodesFromServer && graphEdgesFromServer) {
      return {
        from: "server",
        nodes: graphNodesFromServer,
        edges: graphEdgesFromServer,
      };
    } else if (nodesFromFile && edgesFromFile) {
      return {
        from: "files",
        nodes: nodesFromFile,
        edges: edgesFromFile,
      };
    }

    return {
      from: "bundled",
      nodes: rawNodes,
      edges: rawEdges,
    } as any;
  }, [
    edgesFromFile,
    graphEdgesFromServer,
    graphNodesFromServer,
    nodesFromFile,
  ]);

  return (
    <div className={styles.wrapper}>
      <Graph
        rawEdges={dataSetToUse.edges}
        rawNodes={dataSetToUse.nodes}
        nodeToStartWith={107991}
        edgeHoverTooltip={edgeHoverTooltip}
        nodeHoverTooltip={nodeHoverTooltip}
      />
      <div
        style={{
          display:
            window.localStorage.getItem("specialOps") === "true"
              ? "block"
              : "none",
          position: "fixed",
          top: 0,
          right: 0,
          backgroundColor: "red",
        }}
      >
        Data from: {dataSetToUse.from}
        <br />
        <input
          type="text"
          placeholder="Backend Url"
          value={backendBaseURL}
          onChange={(e) => setBackendURL(e.target.value)}
        />
        <br />
        Nodes:{" "}
        <input
          type="file"
          name="nodes"
          onChange={(e) => {
            readJSONFile(e.target.files![0]).then(setNodesFromFile);
          }}
        />
        <br />
        Edges:{" "}
        <input
          type="file"
          name="edges"
          onChange={(e) => {
            readJSONFile(e.target.files![0]).then(setEdgesFromFile);
          }}
        />
      </div>
    </div>
  );
}

export default App;
