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
    <div className="flex gap-4 p-4">
      {devices.map(({ height, width }, idx) => {
        return (
          <Device
            key={`${height}-${width}`}
            height={height}
            width={width}
            isPrimary={idx === 0}
          />
        );
      })}
    </div>
  );
};

export default Previewer;
