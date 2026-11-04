// Universal client-side route helper matching Laravel routes exactly

const routeMap: Record<string, string> = {
  'home': '/',
  'programs.index': '/programs',
  'programs.show': '/programs/:code',
  'eligibility': '/eligibility',
  'admission.process': '/admission-process',
  'contact': '/contact',
  'apply.index': '/apply',
  'apply.submit': '/apply',
  'apply.success': '/apply/success/:app',
  'public.verify.slip': '/verify-slip',
  'login': '/login',
  'login.post': '/login',
  'logout': '/logout',
  'auth.password.change': '/change-password',
  'auth.password.update': '/change-password',
  'documents.stream': '/documents/:id/stream',

  'student.dashboard': '/student/dashboard',
  'student.roll.slip': '/student/roll-number-slip',
  'student.document.reupload': '/student/documents/:id/reupload',
  'student.exam.gate': '/student/exam/gate',
  'student.exam.verify-pin': '/student/exam/verify-pin',
  'student.exam.waiting': '/student/exam/waiting',
  'student.exam.start': '/student/exam/start',
  'student.exam.active': '/student/exam/active',
  'student.exam.save-answer': '/student/exam/save-answer',
  'student.exam.submit': '/student/exam/submit',
  'student.result.show': '/student/result',

  'admin.dashboard': '/admin/dashboard',
  'admin.sessions.index': '/admin/sessions',
  'admin.sessions.create': '/admin/sessions/create',
  'admin.sessions.store': '/admin/sessions',
  'admin.sessions.edit': '/admin/sessions/:id/edit',
  'admin.sessions.update': '/admin/sessions/:id',
  'admin.sessions.destroy': '/admin/sessions/:id',
  'admin.applications.index': '/admin/applications',
  'admin.applications.show': '/admin/applications/:id',
  'admin.applications.print': '/admin/applications/:id/print',
  'admin.applications.verify': '/admin/applications/:id/verify',
  'admin.documents.verify': '/admin/documents/:id/verify',
  'admin.roll-numbers.index': '/admin/roll-numbers',
  'admin.roll-numbers.assign-single': '/admin/roll-numbers/assign/:id',
  'admin.roll-numbers.assign-bulk': '/admin/roll-numbers/assign-bulk',
  'admin.seat-allocation.index': '/admin/seat-allocation',
  'admin.seat-allocation.reserve': '/admin/seat-allocation/reserve/:id',
  'admin.seat-allocation.confirm': '/admin/seat-allocation/confirm/:id',
  'admin.seat-allocation.release': '/admin/seat-allocation/release/:id',
  'admin.settings.index': '/admin/settings',
  'admin.settings.update': '/admin/settings',
  'admin.audit-logs.index': '/admin/audit-logs',

  'hod.dashboard': '/hod/dashboard',
  'hod.exams.index': '/hod/exams',
  'hod.exams.store': '/hod/exams',
  'hod.exams.update': '/hod/exams/:id',
  'hod.exams.destroy': '/hod/exams/:id',
  'hod.exams.pin': '/hod/exams/:id/pin',
  'hod.exams.status': '/hod/exams/:id/status',
  'hod.exams.questions': '/hod/exams/:id/questions',
  'hod.exams.questions.store': '/hod/exams/:id/questions',
  'hod.exams.questions.update': '/hod/exams/:id/questions/:questionId',
  'hod.exams.questions.destroy': '/hod/exams/:id/questions/:questionId',
  'hod.results.index': '/hod/results',
  'hod.results.adjust': '/hod/results/:id/adjust',
  'hod.results.reset': '/hod/results/:id/reset',
  'hod.results.void': '/hod/results/:id/void',
  'hod.question-bank.index': '/hod/question-bank',
  'hod.question-bank.store': '/hod/question-bank',
  'hod.merit.index': '/hod/merit',
  'hod.merit.formula': '/hod/merit/formula',
  'hod.merit.compile': '/hod/merit/compile',
  'hod.merit.publish': '/hod/merit/:id/publish',
  'hod.merit.print': '/hod/merit/:id/print',

  'invigilator.dashboard': '/invigilator/dashboard',
  'invigilator.attendance.mark': '/invigilator/attendance/mark',
};

export function route(name?: string, params?: any): any {
  if (!name) {
    return {
      current: (pattern?: string) => {
        if (!pattern) return window.location.pathname;
        const currentPath = window.location.pathname;
        // Look up route matching current path
        const currentName = Object.keys(routeMap).find(key => {
          const tmpl = routeMap[key].replace(/:[a-zA-Z0-9_]+/g, '[^/]+');
          return new RegExp(`^${tmpl}$`).test(currentPath);
        });
        if (!currentName) return false;
        if (pattern.endsWith('*')) {
          const prefix = pattern.slice(0, -1);
          return currentName.startsWith(prefix);
        }
        return currentName === pattern;
      }
    };
  }

  let url = routeMap[name];
  if (!url) {
    console.warn(`Route "${name}" not found in routeMap`);
    const cleanPath = name.replace(/\.index$/, '').replace(/\./g, '/');
    return `/${cleanPath}`;
  }

  if (params !== undefined && params !== null) {
    if (typeof params === 'object') {
      for (const [key, val] of Object.entries(params)) {
        if (url.includes(`:${key}`)) {
          url = url.replace(`:${key}`, encodeURIComponent(String(val)));
        } else {
          // append as query param if not in path
          const separator = url.includes('?') ? '&' : '?';
          url += `${separator}${encodeURIComponent(key)}=${encodeURIComponent(String(val))}`;
        }
      }
    } else {
      // Single primitive param replaces first placeholder
      url = url.replace(/:[a-zA-Z0-9_]+/, encodeURIComponent(String(params)));
    }
  }

  return url;
}

// Make globally available in window for any TS / JSX usage
if (typeof window !== 'undefined') {
  (window as any).route = route;
}

export default route;
