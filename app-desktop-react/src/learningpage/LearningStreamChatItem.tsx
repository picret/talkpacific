import { Alert, Card, Modal } from 'antd';
import { DeleteOutlined, EditOutlined, HeartOutlined } from '@ant-design/icons';
import { LearnChatMessage } from '../languagecoach/LanguageCoach';
import ChatItemCoachComponent from './ChatItemTeacherComponent';
import ChatItemUserComponent from './ChatItemStudentComponent';
import { useState } from 'react';
import { useLearningContext } from './LearningContext';

const HandleLikeAction = ({ item }: { item: LearnChatMessage }) => {
  const handleLike = () => {
    console.log('Liking item:', item);
  };

  return <HeartOutlined key="like" onClick={handleLike} style={{ margin: '0' }} />;
};

const HandleEditAction = ({ item }: { item: LearnChatMessage }) => {
  const handleEdit = () => {
    console.log('Editing item:', item);
  };

  return <EditOutlined key="edit" onClick={handleEdit} style={{ margin: '0' }} />;
};

const LearningStreamChatItem = ({ item }: { item: LearnChatMessage }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteFailed, setDeleteFailed] = useState(false);
  const { languageCoach } = useLearningContext();

  const handleDeleteClick = () => setIsDeleting(true);
  const handleDeleteCancel = () => setIsDeleting(false);
  const handleDeleteConfirm = () => {
    languageCoach?.deleteMessages(item.conversation.conversation_id, item.position)
      .then((isSuccess: boolean) => {
        if (isSuccess) {
          setIsDeleting(false);
        } else {
          setDeleteFailed(true);
        }
      })
  };

  return (
    <>
    <Card
      style={{
        width: '90%',
        margin: 'auto',
        position: 'relative',
      }}
      actions={[
        <DeleteOutlined key="delete" onClick={handleDeleteClick} style={{ color: isDeleting ? 'red' : 'inherit' }} />,
        <HandleLikeAction key="like" item={item} />,
        <HandleEditAction key="edit" item={item} />,
      ]}
    >
      <ChatItemUserComponent item={item} />
      <ChatItemCoachComponent item={item} />
    </Card>
    <Modal
      title="Delete Messages"
      open={isDeleting}
      onOk={handleDeleteConfirm}
      onCancel={handleDeleteCancel}
    >
      {deleteFailed && (
        <Alert type="warning" description="Didn't delete messages. Please try again."/>
      )}
      <p>This and every message after will be deleted.</p>
    </Modal>
    </>
  );
};

export default LearningStreamChatItem;
