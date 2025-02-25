import { Form, Select, Button } from 'antd';
import React, { useState } from 'react';
import { Language, availableLanguages, getLanguageByCode, getLanguageByKey, getLanguageDisplayName } from '../languagecoach/Languages';
import { CreateConversationOptions } from '@/languagecoach/LanguageCoach';

interface CreateConversationFormProps {
  onSubmit: (options: CreateConversationOptions) => Promise<void>
}

export type FormValues = {
  primaryLanguage: string;
  learningLanguage: string;
};

const CreateConversationForm: React.FC<CreateConversationFormProps> = ({ onSubmit }) => {
  const [form] = Form.useForm();
  const deviceLanguage: Language = getLanguageByCode(navigator.language);
  const [sourceLanguage, setPrimaryLanguage] = useState<Language>(deviceLanguage);
  const [learningLanguage, setLearningLanguage] = useState<Language | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const showRequired = learningLanguage == undefined;

  const onFinish = async (values: FormValues) => {
    setIsLoading(true);
    const options: CreateConversationOptions = {
      primary: getLanguageByKey(values.primaryLanguage)!!,
      learning: getLanguageByKey(values.learningLanguage)!!,
    };
    await onSubmit(options);
    setIsLoading(false);
  };

  const onPrimaryLanguageChange = (value: string) => {
    const nextLanguage = getLanguageByKey(value);
    if (nextLanguage) {
      setPrimaryLanguage(nextLanguage);
    } else {
      console.error(`Language not found for key: ${value}`);
    }
  };

  return (
    <Form
      form={form}
      onFinish={onFinish}
    >
      <Form.Item
        name="primaryLanguage"
        label="Primary"
        initialValue={deviceLanguage.key}
      >
        <Select
          placeholder="Your Language"
          onChange={onPrimaryLanguageChange}
        >
          {availableLanguages.map((language: Language) => (
            <Select.Option key={language.key} value={language.key}>
              {getLanguageDisplayName(sourceLanguage, language)}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        name="learningLanguage"
        label="Learning"
        rules={[{
          required: showRequired,
          message: 'Select a language to learn!' 
        }]}
      >
        <Select
          placeholder="Language to Learn"
          onChange={(value: string) => {
            const nextLanguage = getLanguageByKey(value);
            if (nextLanguage) {
              setLearningLanguage(nextLanguage);
            } else {
              console.error(`Language not found for key: ${value}`);
            }
          }}
          >
          {availableLanguages.map((language: Language) => (
            <Select.Option key={language.key} value={language.key}>
              {getLanguageDisplayName(sourceLanguage, language)}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item style={{ textAlign: 'center' }}>
        <Button type="primary" htmlType="submit" loading={isLoading}>
          Start
        </Button>
      </Form.Item>
    </Form>
  );
};

export default CreateConversationForm;
