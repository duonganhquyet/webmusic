import React, { useRef } from 'react';
import { Carousel, Button } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import Card from './Card'; 

const MusicHotSlider = ({ songs, getImageUrl, getSubtitle,isLoggedIn }) => {
  const carouselRef = useRef(null);

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    // Giảm số lượng slide hiển thị nếu màn hình nhỏ để tránh bị chèn ép
    slidesToShow: 5, 
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    draggable: true,
    responsive: [
      {
        breakpoint: 1200, 
        settings: { slidesToShow: 4 } // Màn hình vừa: hiện 4
      },
      {
        breakpoint: 992, 
        settings: { slidesToShow: 3 } // Tablet: hiện 3
      },
      {
        breakpoint: 768, 
        settings: { slidesToShow: 2 } // Mobile ngang: hiện 2
      },
      {
        breakpoint: 480, 
        settings: { slidesToShow: 1 } // Mobile dọc: hiện 1
      }
    ]
  };

  const handlePrev = () => {
    carouselRef.current.prev();
  };

  const handleNext = () => {
    carouselRef.current.next();
  };

  if (!songs || songs.length === 0) {
    return <p style={{ color: '#888', fontStyle: 'italic' }}>Không tìm thấy bài hát nào.</p>;
  }

  // Khoảng cách an toàn giữa các ảnh (Padding)
  const GAP = 15; 

  return (
    <div style={{ position: 'relative', margin: `0 -${GAP}px` }}> 
      {/* Margin âm để slider rộng ra, bù lại cho padding của các item con */}

      {/* Nút Trái */}
      <Button 
        shape="circle" 
        icon={<LeftOutlined />} 
        onClick={handlePrev}
        style={{
          position: 'absolute',
          top: '40%',
          left: '0px', 
          zIndex: 10,
          backgroundColor: 'rgba(0,0,0,0.5)',
          color: 'white',
          border: 'none',
          width: '35px',
          height: '35px',
          cursor: 'pointer'
        }}
      />

      {/* Slider */}
      <Carousel ref={carouselRef} {...settings}>
        {songs.map((item) => (
          <div key={item._id}>
            {/* ✅ QUAN TRỌNG: Dùng thẻ div bọc ngoài với padding để tạo khoảng cách */}
            <div style={{ padding: `0 ${GAP}px` }}> 
              
              <Link to={`/track/${item._id}`} style={{ textDecoration: 'none', display: 'block' }} onClick={() => {if(isLoggedIn) handleUpdateHistory(item._id);}}>
                {/* Bắt buộc Card phải co giãn theo width 100% */}
                <div style={{ width: '100%', overflow: 'hidden' }}>
                    <Card 
                      id={item._id} 
                      image={getImageUrl(item.imgUrl)} 
                      title={item.title} 
                      subtitle={getSubtitle(item)} 
                    />
                </div>
              </Link>

            </div>
          </div>
        ))}
      </Carousel>

      {/* Nút Phải */}
      <Button 
        shape="circle" 
        icon={<RightOutlined />} 
        onClick={handleNext}
        style={{
          position: 'absolute',
          top: '40%',
          right: '0px',
          zIndex: 10,
          backgroundColor: 'rgba(0,0,0,0.5)',
          color: 'white',
          border: 'none',
          width: '35px',
          height: '35px',
          cursor: 'pointer'
        }}
      />
    </div>
  );
};

export default MusicHotSlider;