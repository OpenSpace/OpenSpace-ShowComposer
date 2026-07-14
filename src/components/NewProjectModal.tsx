import React, { useEffect, useState } from 'react';
import {
  Button,
  Group,
  InputLabel,
  Modal,
  NumberInput,
  Text,
  Textarea,
  TextInput
} from '@mantine/core';

import { useOpenSpaceApiStore, useSettingsStore } from '@/store';
import { useBoundStore } from '@/store/boundStore';
import { getCopy } from '@/utils/copyHelpers';

import Toggle from './common/Toggle';

interface NewProjectModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  handleLoadProjects: () => void | null;
}

const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  setIsOpen,
  handleLoadProjects
}) => {
  const setProjectSettings = useSettingsStore((state) => state.setProjectSettings);

  const initialState = useSettingsStore((state) => ({
    ip: state.ip || '',
    port: state.port || '',
    pageHeight: state.pageHeight || 1920,
    pageWidth: state.pageWidth || 1080,
    projectName: '',
    projectDescription: '',
    showPagination: state.showPagination || true
  }));

  useEffect(() => {
    if (isOpen) {
      setProjectName(initialState.projectName);
      setProjectDescription(initialState.projectDescription);
      setIp(initialState.ip);
      setPort(initialState.port);
      setPageWidth(initialState.pageWidth);
      setPageHeight(initialState.pageHeight);
      setShowPagination(initialState.showPagination);
    }
  }, [isOpen]);

  const forceRefresh = useOpenSpaceApiStore((state) => state.forceRefresh);
  const removeAllComponents = useBoundStore((state) => state.removeAllComponents);
  const [projectName, setProjectName] = useState(initialState.projectName);
  const [projectDescription, setProjectDescription] = useState(
    initialState.projectDescription
  );
  const [ip, setIp] = useState(initialState.ip);
  const [port, setPort] = useState(initialState.port);
  const [pageWidth, setPageWidth] = useState(initialState.pageWidth);
  const [pageHeight, setPageHeight] = useState(initialState.pageHeight);
  const [showPagination, setShowPagination] = useState<boolean>(
    initialState.showPagination
  );
  const handleShowPagination = (value: boolean) => {
    setShowPagination(value);
  };

  const handleSubmit = () => {
    setProjectSettings({
      projectName,
      projectDescription,
      ip,
      port,
      pageWidth,
      pageHeight,
      showPagination
    });
    removeAllComponents();
    forceRefresh();
    setIsOpen(false);
  };

  return (
    <Modal
      opened={isOpen}
      onClose={() => setIsOpen(false)}
      centered
      title={getCopy('NewProjectModal', 'new_project')}
    >
      <Text>{getCopy('NewProjectModal', 'project_details')}</Text>
      <h4 className={'my-2 text-xl font-semibold dark:text-slate-200'}>Show Settings</h4>
      <div className={'grid gap-2'}>
        <div className={'grid grid-cols-3 items-center gap-4 text-white'}>
          <InputLabel htmlFor={'projectName'}>
            {getCopy('NewProjectModal', 'project_name')}
          </InputLabel>
          <TextInput
            id={'projectName'}
            className={'col-span-2'}
            size={'xs'}
            value={projectName}
            onChange={(e) => setProjectName(e.currentTarget.value)}
            placeholder={'Enter Project Name'}
          />
        </div>
        <div className={'grid grid-cols-3 items-center gap-4 text-white'}>
          <InputLabel htmlFor={'projectDescription'}>
            {getCopy('NewProjectModal', 'project_description')}
          </InputLabel>
          <Textarea
            className={'col-span-2'}
            id={'description'}
            value={projectDescription}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setProjectDescription(e.currentTarget.value)
            }
            placeholder={'Type your description here.'}
          />
        </div>
        <div className={'grid grid-cols-3 items-center gap-4 text-white'}>
          <InputLabel htmlFor={'showPagination'}>Show Pagination</InputLabel>
          <Toggle
            label={'Show Pagination'}
            value={showPagination}
            setValue={handleShowPagination}
          />
        </div>
        <h4 className={'my-2 text-xl font-semibold dark:text-slate-200'}>
          Workspace Settings
        </h4>
        <h4 className={'text-sm font-semibold dark:text-slate-200'}>
          {getCopy('ConnectionSettings', 'openspace_connection')}
        </h4>
        <p className={'text-sm text-slate-500 dark:text-slate-400'}>
          {getCopy('ConnectionSettings', 'address_copy')}
        </p>
        <div className={'grid grid-cols-3 items-center gap-4 text-white'}>
          <InputLabel htmlFor={'ip'}>
            {getCopy('NewProjectModal', 'ip_address')}
          </InputLabel>
          <TextInput
            id={'ip'}
            className={'col-span-2'}
            size={'xs'}
            value={ip}
            onChange={(e) => setIp(e.currentTarget.value)}
            placeholder={'Enter IP'}
          />
        </div>

        <div className={'grid grid-cols-3 items-center gap-4 text-white'}>
          <InputLabel htmlFor={'port'}>{getCopy('NewProjectModal', 'port')}</InputLabel>
          <TextInput
            id={'port'}
            className={'col-span-2'}
            size={'xs'}
            value={port}
            onChange={(e) => setPort(e.currentTarget.value)}
            placeholder={'Enter Port'}
          />
        </div>
        <h4 className={'text-sm font-semibold dark:text-slate-200'}>
          {getCopy('NewProjectModal', 'default_page_size')}
        </h4>
        <p className={'text-sm text-slate-500 dark:text-slate-400'}>
          {getCopy('NewProjectModal', 'default_page_size_copy')}
        </p>
        <div className={'grid grid-cols-3 items-center gap-4 text-white'}>
          <InputLabel htmlFor={'defaultPageSize'}>
            {getCopy('NewProjectModal', 'page_width')}
          </InputLabel>
          <NumberInput
            id={'defaultPageSize'}
            className={'col-span-2'}
            size={'xs'}
            allowDecimal={false}
            value={pageWidth}
            onChange={(value) =>
              setPageWidth(typeof value === 'number' ? value : parseInt(value))
            }
            placeholder={'Enter Default Page Width'}
          />
        </div>
        <div className={'grid grid-cols-3 items-center gap-4 text-white'}>
          <InputLabel htmlFor={'defaultPageSize'}>
            {getCopy('NewProjectModal', 'page_height')}
          </InputLabel>
          <NumberInput
            id={'defaultPageSize'}
            className={'col-span-2'}
            size={'xs'}
            allowDecimal={false}
            value={pageHeight}
            onChange={(value) =>
              setPageHeight(typeof value === 'number' ? value : parseInt(value))
            }
            placeholder={'Enter Default Page Height'}
          />
        </div>
        {/* <div className="grid grid-cols-3 items-center gap-4 text-white">
            <Label htmlFor="defaultScreenSpacePosition">
              {getCopy('NewProjectModal', 'default_screen_space_position')}
            </Label>
            <Input
              id="defaultScreenSpacePosition"
              className="col-span-2 h-8"
              type="text"
              value={defaultScreenSpacePosition}
              onChange={(e) => setDefaultScreenSpacePosition(e.target.value)}
              placeholder="Enter Default Screen Space Position"
            />
          </div> */}
      </div>
      <Group justify={'flex-end'} mt={'md'}>
        <Button variant={'default'} onClick={() => setIsOpen(false)}>
          {getCopy('NewProjectModal', 'cancel')}
        </Button>
        <Button variant={'filled'} onClick={handleSubmit}>
          {getCopy('NewProjectModal', 'create_project')}
        </Button>
        {handleLoadProjects && (
          <Button variant={'filled'} onClick={handleLoadProjects}>
            {getCopy('NewProjectModal', 'load_project')}
          </Button>
        )}
      </Group>
    </Modal>
  );
};

interface ProjectSettingsModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}
const ProjectSettingsModal: React.FC<ProjectSettingsModalProps> = ({
  isOpen,
  setIsOpen
}) => {
  const setProjectSettings = useSettingsStore((state) => state.setProjectSettings);

  const initialState = useSettingsStore((state) => ({
    projectName: state.projectName || '',
    projectDescription: state.projectDescription || '',
    showPagination: state.showPagination || true
  }));
  const [projectName, setProjectName] = useState(initialState.projectName);
  const [projectDescription, setProjectDescription] = useState(
    initialState.projectDescription
  );

  const [showPagination, setShowPagination] = useState<boolean>(
    initialState.showPagination
  );
  const handleShowPagination = (value: boolean) => {
    setShowPagination(value);
  };
  useEffect(() => {
    console.log('initialState', initialState);
    if (isOpen) {
      setProjectName(initialState.projectName);
      setProjectDescription(initialState.projectDescription);
      setShowPagination(initialState.showPagination);
    }
  }, [isOpen]);

  const handleSubmit = () => {
    setProjectSettings({
      projectName,
      projectDescription,
      showPagination
    });
    setIsOpen(false);
  };
  return (
    <Modal
      opened={isOpen}
      onClose={() => setIsOpen(false)}
      centered
      title={getCopy('NewProjectModal', 'update_project_header')}
    >
      <Text>{getCopy('NewProjectModal', 'project_details')}</Text>
      <h4 className={'my-2 text-xl font-semibold dark:text-slate-200'}>Show Settings</h4>
      <div className={'grid gap-2'}>
        <div className={'grid grid-cols-3 items-center gap-4 text-white'}>
          <InputLabel htmlFor={'projectName'}>
            {getCopy('NewProjectModal', 'project_name')}
          </InputLabel>
          <TextInput
            id={'projectName'}
            className={'col-span-2'}
            size={'xs'}
            value={projectName}
            onChange={(e) => setProjectName(e.currentTarget.value)}
            placeholder={'Enter Project Name'}
          />
        </div>
        <div className={'grid grid-cols-3 items-center gap-4 text-white'}>
          <InputLabel htmlFor={'projectDescription'}>
            {getCopy('NewProjectModal', 'project_description')}
          </InputLabel>
          <Textarea
            className={'col-span-2'}
            id={'description'}
            value={projectDescription}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setProjectDescription(e.currentTarget.value)
            }
            placeholder={'Type your description here.'}
          />
        </div>
        <div className={'grid grid-cols-3 items-center gap-4 text-white'}>
          <InputLabel htmlFor={'showPagination'}>Show Pagination</InputLabel>
          <Toggle
            label={'Show Pagination'}
            value={showPagination}
            setValue={handleShowPagination}
          />
        </div>

        {/* <div className="grid grid-cols-3 items-center gap-4 text-white">
        <Label htmlFor="defaultScreenSpacePosition">
          {getCopy('NewProjectModal', 'default_screen_space_position')}
        </Label>
        <Input
          id="defaultScreenSpacePosition"
          className="col-span-2 h-8"
          type="text"
          value={defaultScreenSpacePosition}
          onChange={(e) => setDefaultScreenSpacePosition(e.target.value)}
          placeholder="Enter Default Screen Space Position"
        />
      </div> */}
      </div>
      <Group justify={'flex-end'} mt={'md'}>
        <Button variant={'default'} onClick={() => setIsOpen(false)}>
          {getCopy('NewProjectModal', 'cancel')}
        </Button>
        <Button variant={'filled'} onClick={handleSubmit}>
          {getCopy('NewProjectModal', 'update_project')}
        </Button>
      </Group>
    </Modal>
  );
};

interface WorkspaceSettingsModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const WorkspaceSettingsModal: React.FC<WorkspaceSettingsModalProps> = ({
  isOpen,
  setIsOpen
}) => {
  const setProjectSettings = useSettingsStore((state) => state.setProjectSettings);

  const initialState = useSettingsStore((state) => ({
    ip: state.ip || '',
    port: state.port || '',
    pageHeight: state.pageHeight || 1920,
    pageWidth: state.pageWidth || 1080
  }));

  const [ip, setIp] = useState(initialState.ip);
  const [port, setPort] = useState(initialState.port);
  const [pageWidth, setPageWidth] = useState(initialState.pageWidth);
  const [pageHeight, setPageHeight] = useState(initialState.pageHeight);
  //   const [defaultScreenSpacePosition, setDefaultScreenSpacePosition] =
  //     useState(initialState.pageWidth);
  // const [isOpen, setIsOpen] = useState<boolean>(triggerProjectName);

  const handleSubmit = () => {
    setProjectSettings({
      ip,
      port,
      pageWidth,
      pageHeight
    });
    // removeAllComponents();
    // forceRefresh();
    setIsOpen(false);
  };

  return (
    <Modal
      opened={isOpen}
      onClose={() => setIsOpen(false)}
      centered
      title={'Workspace Settings'}
    >
      <Text>Update your workspace settings here</Text>
      <div className={'grid gap-2'}>
        <h4 className={'text-sm font-semibold dark:text-slate-200'}>
          {getCopy('ConnectionSettings', 'openspace_connection')}
        </h4>
        <p className={'text-sm text-slate-500 dark:text-slate-400'}>
          {getCopy('ConnectionSettings', 'address_copy')}
        </p>
        <div className={'grid grid-cols-3 items-center gap-4 text-white'}>
          <InputLabel htmlFor={'ip'}>
            {getCopy('NewProjectModal', 'ip_address')}
          </InputLabel>
          <TextInput
            id={'ip'}
            className={'col-span-2'}
            size={'xs'}
            value={ip}
            onChange={(e) => setIp(e.currentTarget.value)}
            placeholder={'Enter IP'}
          />
        </div>

        <div className={'grid grid-cols-3 items-center gap-4 text-white'}>
          <InputLabel htmlFor={'port'}>{getCopy('NewProjectModal', 'port')}</InputLabel>
          <TextInput
            id={'port'}
            className={'col-span-2'}
            size={'xs'}
            value={port}
            onChange={(e) => setPort(e.currentTarget.value)}
            placeholder={'Enter Port'}
          />
        </div>
        <h4 className={'text-sm font-semibold dark:text-slate-200'}>
          {getCopy('NewProjectModal', 'default_page_size')}
        </h4>
        <p className={'text-sm text-slate-500 dark:text-slate-400'}>
          {getCopy('NewProjectModal', 'default_page_size_copy')}
        </p>
        <div className={'grid grid-cols-3 items-center gap-4 text-white'}>
          <InputLabel htmlFor={'defaultPageSize'}>
            {getCopy('NewProjectModal', 'page_width')}
          </InputLabel>
          <NumberInput
            id={'defaultPageSize'}
            className={'col-span-2'}
            size={'xs'}
            allowDecimal={false}
            value={pageWidth}
            onChange={(value) =>
              setPageWidth(typeof value === 'number' ? value : parseInt(value))
            }
            placeholder={'Enter Default Page Width'}
          />
        </div>
        <div className={'grid grid-cols-3 items-center gap-4 text-white'}>
          <InputLabel htmlFor={'defaultPageSize'}>
            {getCopy('NewProjectModal', 'page_height')}
          </InputLabel>
          <NumberInput
            id={'defaultPageSize'}
            className={'col-span-2'}
            size={'xs'}
            allowDecimal={false}
            value={pageHeight}
            onChange={(value) =>
              setPageHeight(typeof value === 'number' ? value : parseInt(value))
            }
            placeholder={'Enter Default Page Height'}
          />
        </div>
      </div>
      <Group justify={'flex-end'} mt={'md'}>
        <Button variant={'default'} onClick={() => setIsOpen(false)}>
          {getCopy('NewProjectModal', 'cancel')}
        </Button>
        <Button variant={'filled'} onClick={handleSubmit}>
          Save Settings
        </Button>
      </Group>
    </Modal>
  );
};

export { NewProjectModal, ProjectSettingsModal, WorkspaceSettingsModal };
