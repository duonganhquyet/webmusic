import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Row, Col, Input, Typography, Space, Avatar, Button } from "antd";
import { UserAddOutlined, CheckOutlined } from "@ant-design/icons";
import { useAuthContext } from "../../contexts/auth.context";
import { postCommentAPI, followUserAPI, checkFollowStatusAPI } from "../../services/api";
import { Link } from "react-router-dom";

dayjs.extend(relativeTime);

const { Text, Paragraph } = Typography;


const CommentTrack = (props) => {
  const { formatTime, track, comments, currentTime,fetchCommentData } = props;

  const {auth} = useAuthContext();
  const isLoggedIn = !!(auth && auth.user && auth.user._id);

  const [value, setValue] = useState("");
  const [isFollowed, setIsFollowed] = useState(false);

  // --- LOGIC FOLLOW ---
  const handleFollow = async () => {
    if (!isLoggedIn) {
        alert("Vui lòng đăng nhập để theo dõi tác giả!");
        return;
    }
    const uploaderId = track?.uploader?._id || track?.uploader;
    if (!uploaderId) return;

    try {
        if (isFollowed) {
            await followUserAPI(uploaderId);
            setIsFollowed(false);
        } else {
            await followUserAPI(uploaderId);
            setIsFollowed(true);
        }
    } catch (error) {
        console.error("Lỗi Follow:", error);
    }
  };
  
  // Reset trạng thái follow khi đổi bài hát
  useEffect(()=> {
    const uploaderId = track?.uploader?._id || track?.uploader;
    if(!uploaderId) return;

    const checkFollowStatus = async () => {
      try {
        const response = await checkFollowStatusAPI(uploaderId);
        if (response && response.data) {
            setIsFollowed(response.data.isFollowing);
        }
      } catch (e) {
        console.error("Check follow status error", e);
      }
    }
    checkFollowStatus();

  }, [track]);
  // --------------------

  const postComment = async (content, moment) => {
    const trackId = track?._id;
    const uId = auth?.user?._id;
    if (!uId || !trackId) return false;
    try {
      const res = await postCommentAPI(uId, trackId, content, moment);
      if (res && res.data) {
        alert("Comment posted successfully!");
        return true;
      }
    } catch (e) {
      console.error(e);
      alert("Failed to post comment.");
    }
    return false;
  };

  return (
    <div style={{ maxWidth: "100%" }}>
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onPressEnter={async () => {
          if (!isLoggedIn) {
            alert("You must be logged in to comment.");
            return;
          }
          const content = value.trim();
          if (content.length > 0) {
            const ok = await postComment(content, Math.round(currentTime));
            if (ok) {
              setValue("");
              fetchCommentData();
            }
          }
        }}
        placeholder="Comments"
        variant="underlined"
        allowClear
      />

      <div style={{ marginTop: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={6} xl={4}>
            <div style={{display: "flex",alignContent: "center",flexDirection: "column"}}>
              <Link to={`/user/${track?.uploader?._id}`}>
                <img
                  src={(track?.uploader?.imgUrl && track?.uploader?.imgUrl !== "default_avatar.png") 
                                      ? `${import.meta.env.VITE_BACKEND_URL}/images/avatar/${track?.uploader?.imgUrl}` 
                                      : "../../../public/default_avatar.png"}
                  alt="Lỗi tải ảnh"
                  width={150}
                  height={150}
                  style={{ objectFit: "cover", borderRadius: "50%", alignSelf: "center" }}
                />
              </Link>
              <div style={{ marginTop: 8, textAlign: "center" }}>
                <Link to={`/user/${track?.uploader?._id}`}><Text style={{marginLeft:-30, fontWeight: 700}}>{track?.uploader?.name}</Text></Link>
                 
                 {/* === NÚT FOLLOW (MỚI) === */}
                 {track?.uploader?._id !== auth?.user?._id && (
                    <div style={{ marginTop: 5,marginLeft: -30 }}>
                        <Button
                            type={isFollowed ? "primary" : "default"}
                            icon={isFollowed ? <CheckOutlined /> : <UserAddOutlined />}
                            onClick={handleFollow}
                            size="small"
                        >
                            {isFollowed ? "Following" : "Follow"}
                        </Button>
                    </div>
                 )}

              </div>
            </div>
          </Col>

          <Col xs={24} lg={18} xl={20}>
            <div>
              {comments?.map((comment) => (
                <div
                  key={comment._id}
                  style={{
                    marginBottom: 16,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 16,
                  }}
                >
                  <Space align="start" size={12}>
                    <Avatar
                      src={(comment?.user?.imgUrl && comment?.user?.imgUrl !== "default_avatar.png") 
                                    ? `${import.meta.env.VITE_BACKEND_URL}/images/${comment.user.imgUrl}` 
                                    : "../../../public/default_avatar.png"}
                                    
                      size={40}
                    />
                    <div>
                      <Text style={{ fontSize: 14 }}>
                        {comment.user.name}  <span style={{color: "#00000073"}}>at {formatTime(comment.moment)}</span>
                      </Text>
                      <Paragraph style={{ marginBottom: 0 }}>
                        {comment.content}
                      </Paragraph>
                    </div>
                  </Space>

                  <Text type="secondary">
                    {dayjs(comment.createdAt).fromNow()}
                  </Text>
                </div>
              ))}
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default CommentTrack;
