import React, { useEffect, useState } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useOpenSpaceApiStore, useSettingsStore } from '@/store';
import { useBoundStore } from '@/store/boundStore';
import { getCopy } from '@/utils/copyHelpers';

import Toggle from './common/Toggle';
import { Textarea } from './ui/textarea';

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
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      {/* <AlertDialogTrigger asChild>
        <Button variant="secondary" className="justify-start gap-2">
          <PlusIcon />
          <div className="ml-2 text-xs font-bold ">
            {getCopy('NewProjectModal', 'new_project')}
          </div>
        </Button>
      </AlertDialogTrigger> */}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{getCopy('NewProjectModal', 'new_project')}</AlertDialogTitle>
          <AlertDialogDescription>
            {getCopy('NewProjectModal', 'project_details')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <h4 className={'my-2 text-xl font-semibold dark:text-slate-200'}>
          Show Settings
        </h4>
        <div className={'grid gap-2'}>
          <div className={'grid grid-cols-3 items-center gap-4 text-white'}>
            <Label htmlFor={'projectName'}>
              {getCopy('NewProjectModal', 'project_name')}
            </Label>
            <Input
              id={'projectName'}
              className={'col-span-2 h-8'}
              type={'text'}
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder={'Enter Project Name'}
            />
          </div>
          <div className={'grid grid-cols-3 items-center gap-4 text-white'}>
            <Label htmlFor={'projectDescription'}>
              {getCopy('NewProjectModal', 'project_description')}
            </Label>
            <Textarea
              className={'col-span-2 h-8'}
              id={'description'}
              value={projectDescription}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setProjectDescription(e.target.value)
              }
              placeholder={'Type your description here.'}
            />
          </div>
          <div className={'grid grid-cols-3 items-center gap-4 text-white'}>
            <Label htmlFor={'showPagination'}>Show Pagination</Label>
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
            <Label htmlFor={'ip'}>{getCopy('NewProjectModal', 'ip_address')}</Label>
            <Input
              id={'ip'}
              className={'col-span-2 h-8'}
              type={'text'}
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              placeholder={'Enter IP'}
            />
          </div>

          <div className={'grid grid-cols-3 items-center gap-4 text-white'}>
            <Label htmlFor={'port'}>{getCopy('NewProjectModal', 'port')}</Label>
            <Input
              id={'port'}
              className={'col-span-2 h-8'}
              type={'text'}
              value={port}
              onChange={(e) => setPort(e.target.value)}
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
            <Label htmlFor={'defaultPageSize'}>
              {getCopy('NewProjectModal', 'page_width')}
            </Label>
            <Input
              id={'defaultPageSize'}
              className={'col-span-2 h-8'}
              type={'number'}
              value={pageWidth}
              onChange={(e) => setPageWidth(parseInt(e.target.value))}
              placeholder={'Enter Default Page Width'}
            />
          </div>
          <div className={'grid grid-cols-3 items-center gap-4 text-white'}>
            <Label htmlFor={'defaultPageSize'}>
              {getCopy('NewProjectModal', 'page_height')}
            </Label>
            <Input
              id={'defaultPageSize'}
              className={'col-span-2 h-8'}
              type={'number'}
              value={pageHeight}
              onChange={(e) => setPageHeight(parseInt(e.target.value))}
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
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setIsOpen(false)}>
            {getCopy('NewProjectModal', 'cancel')}
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleSubmit}>
            {getCopy('NewProjectModal', 'create_project')}
          </AlertDialogAction>
          {handleLoadProjects && (
            <AlertDialogAction onClick={handleLoadProjects}>
              {getCopy('NewProjectModal', 'load_project')}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
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
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      {/* <AlertDialogTrigger asChild>
    <Button variant="secondary" className="justify-start gap-2">
      <PlusIcon />
      <div className="ml-2 text-xs font-bold ">
        {getCopy('NewProjectModal', 'new_project')}
      </div>
    </Button>
  </AlertDialogTrigger> */}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {getCopy('NewProjectModal', 'update_project_header')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {getCopy('NewProjectModal', 'project_details')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <h4 className={'my-2 text-xl font-semibold dark:text-slate-200'}>
          Show Settings
        </h4>
        <div className={'grid gap-2'}>
          <div className={'grid grid-cols-3 items-center gap-4 text-white'}>
            <Label htmlFor={'projectName'}>
              {getCopy('NewProjectModal', 'project_name')}
            </Label>
            <Input
              id={'projectName'}
              className={'col-span-2 h-8'}
              type={'text'}
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder={'Enter Project Name'}
            />
          </div>
          <div className={'grid grid-cols-3 items-center gap-4 text-white'}>
            <Label htmlFor={'projectDescription'}>
              {getCopy('NewProjectModal', 'project_description')}
            </Label>
            <Textarea
              className={'col-span-2 h-8'}
              id={'description'}
              value={projectDescription}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setProjectDescription(e.target.value)
              }
              placeholder={'Type your description here.'}
            />
          </div>
          <div className={'grid grid-cols-3 items-center gap-4 text-white'}>
            <Label htmlFor={'showPagination'}>Show Pagination</Label>
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
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setIsOpen(false)}>
            {getCopy('NewProjectModal', 'cancel')}
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleSubmit}>
            {getCopy('NewProjectModal', 'update_project')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
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
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Workspace Settings</AlertDialogTitle>
          <AlertDialogDescription>
            Update your workspace settings here
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className={'grid gap-2'}>
          <h4 className={'text-sm font-semibold dark:text-slate-200'}>
            {getCopy('ConnectionSettings', 'openspace_connection')}
          </h4>
          <p className={'text-sm text-slate-500 dark:text-slate-400'}>
            {getCopy('ConnectionSettings', 'address_copy')}
          </p>
          <div className={'grid grid-cols-3 items-center gap-4 text-white'}>
            <Label htmlFor={'ip'}>{getCopy('NewProjectModal', 'ip_address')}</Label>
            <Input
              id={'ip'}
              className={'col-span-2 h-8'}
              type={'text'}
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              placeholder={'Enter IP'}
            />
          </div>

          <div className={'grid grid-cols-3 items-center gap-4 text-white'}>
            <Label htmlFor={'port'}>{getCopy('NewProjectModal', 'port')}</Label>
            <Input
              id={'port'}
              className={'col-span-2 h-8'}
              type={'text'}
              value={port}
              onChange={(e) => setPort(e.target.value)}
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
            <Label htmlFor={'defaultPageSize'}>
              {getCopy('NewProjectModal', 'page_width')}
            </Label>
            <Input
              id={'defaultPageSize'}
              className={'col-span-2 h-8'}
              type={'number'}
              value={pageWidth}
              onChange={(e) => setPageWidth(parseInt(e.target.value))}
              placeholder={'Enter Default Page Width'}
            />
          </div>
          <div className={'grid grid-cols-3 items-center gap-4 text-white'}>
            <Label htmlFor={'defaultPageSize'}>
              {getCopy('NewProjectModal', 'page_height')}
            </Label>
            <Input
              id={'defaultPageSize'}
              className={'col-span-2 h-8'}
              type={'number'}
              value={pageHeight}
              onChange={(e) => setPageHeight(parseInt(e.target.value))}
              placeholder={'Enter Default Page Height'}
            />
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setIsOpen(false)}>
            {getCopy('NewProjectModal', 'cancel')}
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleSubmit}>Save Settings</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export { NewProjectModal, ProjectSettingsModal, WorkspaceSettingsModal };
