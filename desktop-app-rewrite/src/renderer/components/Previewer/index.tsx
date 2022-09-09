import Device from './Device';

const devices = [
  {
    height: 400,
    width: 250,
    name: 'iPhone 11',
  },
  {
    height: 600,
    width: 400,
    name: 'iPad Pro',
  },
];

const Previewer = () => {
  return (
    <div className="flex gap-4 p-4">
      {devices.map(({ height, width, name }, idx) => {
        return (
          <Device
            key={`${height}-${width}`}
            height={height}
            width={width}
            isPrimary={idx === 0}
            name={name}
          />
        );
      })}
    </div>
  );
};

export default Previewer;
