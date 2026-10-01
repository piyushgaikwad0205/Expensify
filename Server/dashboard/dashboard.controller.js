import * as dashboardService from './dashboard.service.js';

export const getDashboard = async (req, res, next) => {
  try {
    const data = await dashboardService.getDashboardData(req.user?.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
