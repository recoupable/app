"use client";

import TasksTabs from "./TasksTabs";
import PageContainer from "./PageContainer";
import { TasksPageHeader } from "./TasksPageHeader";

const TasksPage = () => {
  return (
    <div className="grow py-8">
      <PageContainer>
        <TasksPageHeader />
        <TasksTabs />
      </PageContainer>
    </div>
  );
};

export default TasksPage;
