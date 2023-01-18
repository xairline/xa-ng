import Apps from '../components/apps/apps';

export function Index() {
  return (
    <div className="h-full bg-slate-200 flex flex-wrap items-center justify-center overflow-auto">
      <Apps
        Title={'Flight Logs'}
        Description={'History analysis and reporting'}
        Link={'/flight-logs'}
        Icon={`/images/apps/logs.png`}
      />
      <Apps
        Title={'VA Centre'}
        Description={'Manage Virtual Airline Flights'}
        Link={'/va'}
        Icon={`/images/apps/va.png`}
      />
      {/*<Apps*/}
      {/*  Title={'Settings'}*/}
      {/*  Description={'History analysis and reporting'}*/}
      {/*  Link={''}*/}
      {/*  Icon={`/images/apps/settings.png`}*/}
      {/*/>*/}
      <Apps Title={'Docs'} Description={'User manual'} Link={''} Icon={`/images/apps/docs.png`}/>
      <Apps
        Title={'Developers'}
        Description={'How to add your own app'}
        Link={''}
        Icon={`/images/apps/dev.png`}
      />
    </div>
  );
}

export default Index;
