import Apps from "../components/apps/apps";

export function Index() {
  return (
    <div className="h-full bg-gray-50 flex flex-wrap items-center justify-center overflow-auto">
      <div className="shrink"><Apps/></div>
      <div className="shrink"><Apps/></div>
      <div className="shrink"><Apps/></div>
      <div className="shrink"><Apps/></div>
      <div className="shrink"><Apps/></div>
    </div>
  );
}

export default Index;
