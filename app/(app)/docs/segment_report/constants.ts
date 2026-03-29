export const codeExamples = {
  curl: `curl -X POST "https://api.recoupable.com/api/create_report" \\
  -H "Content-Type: application/json" \\
  -d '{"segmentId": "YOUR_SEGMENT_ID"}'`,
  python: `import requests

headers = {
    "Content-Type": "application/json"
}

data = {
    "segmentId": "YOUR_SEGMENT_ID"
}

response = requests.post("https://api.recoupable.com/api/create_report", headers=headers, json=data)
data = response.json()`,
  javascript: `fetch("https://api.recoupable.com/api/create_report", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    segmentId: "YOUR_SEGMENT_ID"
  })
})
.then(response => response.json())
.then(data => console.log(data));`,
  typescript: `const createSegmentReport = async (segmentId: string) => {
  const response = await fetch("https://api.recoupable.com/api/create_report", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      segmentId
    })
  });
  const data: SegmentReportResponse = await response.json();
  return data;
};`,
} as const;

export const exampleResponse = {
  status: "success",
  reportId: "60e2cae6-5752-4789-9c8f-a144060bf34d",
} as const;

export const responseProperties = [
  {
    name: "status",
    type: "string",
    description: 'Status of the request ("success" or "error")',
  },
  {
    name: "reportId",
    type: "string",
    description: "Unique identifier for the generated segment report",
  },
  {
    name: "error",
    type: "string",
    description: "Error message if the request failed (only present on error)",
  },
] as const;

export interface SegmentReportResponse {
  status: "success" | "error";
  reportId?: string;
  error?: string;
}
