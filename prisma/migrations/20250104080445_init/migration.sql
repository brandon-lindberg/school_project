-- CreateTable
CREATE TABLE "User" (
    "user_id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "full_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "School" (
    "school_id" SERIAL NOT NULL,
    "site_id" TEXT NOT NULL,
    "name_en" TEXT,
    "name_jp" TEXT,
    "location_en" TEXT,
    "location_jp" TEXT,
    "phone_en" TEXT,
    "phone_jp" TEXT,
    "email_en" TEXT,
    "email_jp" TEXT,
    "address_en" TEXT,
    "address_jp" TEXT,
    "curriculum_en" TEXT,
    "curriculum_jp" TEXT,
    "structured_data" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "School_pkey" PRIMARY KEY ("school_id")
);

-- CreateTable
CREATE TABLE "UserList" (
    "list_id" SERIAL NOT NULL,
    "list_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "UserList_pkey" PRIMARY KEY ("list_id")
);

-- CreateTable
CREATE TABLE "UserListSchools" (
    "list_id" INTEGER NOT NULL,
    "school_id" INTEGER NOT NULL,

    CONSTRAINT "UserListSchools_pkey" PRIMARY KEY ("list_id","school_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "UserList" ADD CONSTRAINT "UserList_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserListSchools" ADD CONSTRAINT "UserListSchools_list_id_fkey" FOREIGN KEY ("list_id") REFERENCES "UserList"("list_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserListSchools" ADD CONSTRAINT "UserListSchools_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("school_id") ON DELETE RESTRICT ON UPDATE CASCADE;
