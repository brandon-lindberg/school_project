import { POST, GET, DELETE } from "./route";
import prisma from "../../../lib/prisma";
import { getServerSession } from "next-auth";

// Mock next-auth
jest.mock("next-auth");
const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;

// Mock Prisma
jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
    },
    browsingHistory: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));

describe("Browsing History API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set up default mock implementation for findFirst
    (prisma.browsingHistory.findFirst as jest.Mock).mockResolvedValue(null);
    // Set up default mock implementation for update
    (prisma.browsingHistory.update as jest.Mock).mockResolvedValue({
      history_id: 1,
      user_id: 1,
      school_id: 123,
      viewed_at: new Date(),
    });
  });

  const mockUser = {
    user_id: 1,
    email: "test@example.com",
  };

  const mockSession = {
    user: { email: "test@example.com" },
  };

  describe("POST /api/browsing", () => {
    it("should create a browsing history entry when none exists", async () => {
      mockGetServerSession.mockResolvedValue(mockSession);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.browsingHistory.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.browsingHistory.create as jest.Mock).mockResolvedValue({
        history_id: 1,
        user_id: 1,
        school_id: 123,
        viewed_at: new Date(),
      });

      const request = new Request("http://localhost:3000/api/browsing", {
        method: "POST",
        body: JSON.stringify({ schoolId: 123 }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty("history_id");
      expect(prisma.browsingHistory.findFirst).toHaveBeenCalledWith({
        where: {
          user_id: 1,
          school_id: 123,
        },
      });
      expect(prisma.browsingHistory.create).toHaveBeenCalledWith({
        data: {
          user_id: 1,
          school_id: 123,
        },
      });
    });

    it("should update existing browsing history entry", async () => {
      const now = new Date();
      const existingEntry = {
        history_id: 1,
        user_id: 1,
        school_id: 123,
        viewed_at: now,
      };

      mockGetServerSession.mockResolvedValue(mockSession);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.browsingHistory.findFirst as jest.Mock).mockResolvedValue(existingEntry);
      (prisma.browsingHistory.update as jest.Mock).mockResolvedValue({
        ...existingEntry,
        viewed_at: now,
      });

      const request = new Request("http://localhost:3000/api/browsing", {
        method: "POST",
        body: JSON.stringify({ schoolId: 123 }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty("history_id");
      expect(prisma.browsingHistory.findFirst).toHaveBeenCalledWith({
        where: {
          user_id: 1,
          school_id: 123,
        },
      });
      expect(prisma.browsingHistory.update).toHaveBeenCalledWith({
        where: { history_id: 1 },
        data: { viewed_at: expect.any(Date) },
      });
    });

    it("should return 401 if user is not authenticated", async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new Request("http://localhost:3000/api/browsing", {
        method: "POST",
        body: JSON.stringify({ schoolId: 123 }),
      });

      const response = await POST(request);
      expect(response.status).toBe(401);
    });
  });

  describe("GET /api/browsing", () => {
    it("should return user's browsing history", async () => {
      mockGetServerSession.mockResolvedValue(mockSession);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.browsingHistory.findMany as jest.Mock).mockResolvedValue([
        {
          history_id: 1,
          user_id: 1,
          school_id: 123,
          viewed_at: new Date(),
          school: { name_en: "Test School" },
        },
      ]);

      const request = new Request("http://localhost:3000/api/browsing");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data[0]).toHaveProperty("school");
    });

    it("should return 401 if user is not authenticated", async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new Request("http://localhost:3000/api/browsing");
      const response = await GET(request);
      expect(response.status).toBe(401);
    });
  });

  describe("DELETE /api/browsing", () => {
    it("should delete a specific history entry", async () => {
      mockGetServerSession.mockResolvedValue(mockSession);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.browsingHistory.findUnique as jest.Mock).mockResolvedValue({
        history_id: 1,
        user_id: 1,
        school_id: 123,
        viewed_at: new Date(),
      });

      const request = new Request("http://localhost:3000/api/browsing?historyId=1");
      const response = await DELETE(request);

      expect(response.status).toBe(200);
      expect(prisma.browsingHistory.delete).toHaveBeenCalledWith({
        where: { history_id: 1 },
      });
    });

    it("should delete all history entries for a user", async () => {
      mockGetServerSession.mockResolvedValue(mockSession);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const request = new Request("http://localhost:3000/api/browsing");
      const response = await DELETE(request);

      expect(response.status).toBe(200);
      expect(prisma.browsingHistory.deleteMany).toHaveBeenCalledWith({
        where: { user_id: 1 },
      });
    });

    it("should return 401 if user is not authenticated", async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new Request("http://localhost:3000/api/browsing");
      const response = await DELETE(request);
      expect(response.status).toBe(401);
    });
  });
});
