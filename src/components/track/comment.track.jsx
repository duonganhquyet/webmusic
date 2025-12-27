import React from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Row, Col, Input, Typography, Space, Avatar } from "antd";

dayjs.extend(relativeTime);

const { Text, Paragraph } = Typography;

/**
 * Props:
 * - formatTime: (seconds:number) => string
 * - track: ITrackTop | null
 * - comments: ITrackComment[] | null
 */
const CommentTrack = (props) => {
  const { formatTime, track, comments } = props;

  return (
    <div style={{ maxWidth: "100%" }}>
      <Input
        onPressEnter={(e) => {
          const content = e.target.value;
          console.log("Submit comment:", content);
        }}
        placeholder="Comments"
        // antd Input không có label như MUI TextField,
        // nếu bạn muốn label, có thể bọc bằng Form.Item ở ngoài.
        variant="underlined"
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
