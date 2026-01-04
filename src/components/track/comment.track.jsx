import React, { useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Row, Col, Input, Typography, Space, Avatar } from "antd";
import { useAuthContext } from "../../contexts/auth.context";
import { postCommentAPI } from "../../services/api";

dayjs.extend(relativeTime);

const { Text, Paragraph } = Typography;


const CommentTrack = (props) => {
  const { formatTime, track, comments, currentTime,fetchCommentData } = props;

  const {auth} = useAuthContext();
  const isLoggedIn = !!(auth && auth.user && auth.user._id);

  const [value, setValue] = useState("");

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
              <img
                src={"../../public/default-avatar.png"}
                alt=""
                width={150}
                height={150}
                style={{ objectFit: "cover", borderRadius: 8, alignSelf: "center" }}
              />
              <div style={{ marginTop: 8, textAlign: "center" }}>
                <Text>{track?.uploader?.name}</Text>
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
                      src={"../../public/default-avatar.png"}
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
