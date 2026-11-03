import { getAdminSupabaseClient } from "./supabase-client";

export interface WorkspaceClass {
  id: string;
  title: string;
  teacher: string;
  category: string;
  students: number;
  status: "진행 중" | "모집 중" | "마감 임박" | "임시 저장";
  date: string;
  scheduledOn?: string;
  color: "mint" | "peach" | "yellow" | "blue";
}

export interface WorkspaceCreator {
  name: string;
  role: string;
  category: string;
  classes: number;
  students: number;
  status: string;
}

export interface WorkspaceMetrics {
  monthlyRevenue: number;
  monthlyRevenueGrowth: number;
  totalStudents: number;
  studentGrowth: number;
  newClassesThisMonth: number;
  liveParticipants: number;
  liveCapacity: number;
  liveChatMessages: number;
  connectionQuality: string;
  revenueTrend: number[];
  studentTrend: number[];
  classTrend: number[];
}

export interface WorkspaceFaq {
  id: string;
  question: string;
  answer: string;
}

export interface WorkspaceSettings {
  workspaceName: string;
  adminEmail: string;
  notifications: boolean;
  weeklyReport: boolean;
}

export async function getWorkspaceData() {
  const client = getAdminSupabaseClient();
  const [classesResult, creatorsResult, metricsResult, settingsResult, faqsResult] =
    await Promise.all([
      client.from("workspace_classes").select("*").order("sort_order"),
      client.from("workspace_creators").select("*").order("sort_order"),
      client.from("workspace_dashboard_metrics").select("*").eq("id", 1).maybeSingle(),
      client.from("workspace_settings").select("*").eq("id", 1).maybeSingle(),
      client.from("workspace_faqs").select("*").order("sort_order"),
    ]);

  const error =
    classesResult.error ??
    creatorsResult.error ??
    metricsResult.error ??
    settingsResult.error ??
    faqsResult.error;
  if (error) throw error;

  return {
    classes: (classesResult.data ?? []).map(
      (row): WorkspaceClass => ({
        id: row.id,
        title: row.title,
        teacher: row.teacher,
        category: row.category,
        students: row.students,
        status: row.status,
        date: row.date_label,
        scheduledOn: row.scheduled_on ?? undefined,
        color: row.color,
      }),
    ),
    creators: (creatorsResult.data ?? []).map(
      (row): WorkspaceCreator => ({
        name: row.name,
        role: row.role,
        category: row.category,
        classes: row.class_count,
        students: row.students,
        status: row.status,
      }),
    ),
    metrics: metricsResult.data
      ? {
          monthlyRevenue: Number(metricsResult.data.monthly_revenue),
          monthlyRevenueGrowth: Number(metricsResult.data.monthly_revenue_growth),
          totalStudents: metricsResult.data.total_students,
          studentGrowth: Number(metricsResult.data.student_growth),
          newClassesThisMonth: metricsResult.data.new_classes_this_month,
          liveParticipants: metricsResult.data.live_participants,
          liveCapacity: metricsResult.data.live_capacity,
          liveChatMessages: metricsResult.data.live_chat_messages,
          connectionQuality: metricsResult.data.connection_quality,
          revenueTrend: metricsResult.data.revenue_trend.map(Number),
          studentTrend: metricsResult.data.student_trend.map(Number),
          classTrend: metricsResult.data.class_trend.map(Number),
        }
      : null,
    settings: settingsResult.data
      ? {
          workspaceName: settingsResult.data.workspace_name,
          adminEmail: settingsResult.data.admin_email,
          notifications: settingsResult.data.notifications_enabled,
          weeklyReport: settingsResult.data.weekly_report_enabled,
        }
      : null,
    faqs: (faqsResult.data ?? []).map((row): WorkspaceFaq => ({
      id: row.id,
      question: row.question,
      answer: row.answer,
    })),
  };
}