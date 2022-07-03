import Device from './Device';

const devices = [
  {
    height: 400,
    width: 250,
  },
  {
    height: 600,
    width: 400,
  },
];

const Previewer = () => {
  return (
    <div className="flex gap-4">
      {devices.map(({ height, width }) => {
        return (
          <Device key={`${height}-${width}`} height={height} width={width} />
        );
      })}
    </div>
  );
};

export default Previewer;
