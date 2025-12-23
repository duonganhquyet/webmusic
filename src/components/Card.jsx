const Card = ({ image, title, subtitle }) => {
  return (
    <div style={{ width: '200px', cursor: 'pointer', marginRight: '20px' }}>
      <div style={{ position: 'relative', width: '200px', height: '200px', overflow: 'hidden' }}>
        <img src={image} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        {/* Play button overlay effect could go here */}
      </div>
      <h3 style={{ fontSize: '14px', margin: '8px 0 4px 0', fontWeight: '400' }}>{title}</h3>
      <p style={{ fontSize: '12px', color: '#999', margin: 0 }}>{subtitle}</p>
    </div>
  );
};

export default Card;