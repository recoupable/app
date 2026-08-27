"use client";

import TasksTabs from "./TasksTabs";
import PageContainer from "./PageContainer";
import { TasksPageHeader } from "./TasksPageHeader";

const TasksPage = () => {
  return (
    <div className="max-w-full md:max-w-[calc(100vw-200px)] grow py-8 px-6 md:px-12">
      <PageContainer>
        <TasksPageHeader />
        <TasksTabs />
      </PageContainer>
    </div>
  );
};

export default TasksPage;
