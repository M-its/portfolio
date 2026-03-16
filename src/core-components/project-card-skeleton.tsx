import Skeleton from "../components/skeleton";
import Divider from "../components/divider";

export default function ProjectCardSkeleton() {
  return (
    <div className="relative w-full h-full">
      <div className="relative w-full h-full rounded-3xl overflow-hidden bg-white/2 border border-white/5">
        <div className="p-6 flex flex-col gap-4 w-full h-full">
          {/* Título */}
          <Skeleton className="project-card-title h-7 w-2/3" />
          {/* Body — vira flex-row no primeiro/último card em sm+ */}
          <div className="project-card-body flex flex-col gap-3.5 flex-1">
            {/* Imagem */}
            <div className="project-card-image w-full">
              <Skeleton className="w-full aspect-video" rounded="lg" />
            </div>

            {/* Conteúdo */}
            <div className="project-card-content flex flex-col gap-3 min-w-0 w-full">
              <div className="flex flex-col gap-4">
                <div className="project-card-description flex flex-col gap-2 h-14">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                </div>

                {/* Tags */}
                <div className="flex gap-2">
                  <Skeleton rounded="full" className="h-6 w-16" />
                  <Skeleton rounded="full" className="h-6 w-20" />
                  <Skeleton rounded="full" className="h-6 w-14" />
                  <Skeleton rounded="full" className="h-6 w-16" />
                </div>
              </div>

              <div className="flex flex-col gap-4 mt-auto pt-2">
                <Divider className="w-full opacity-40" />
                {/* Botões */}
                <div className="flex gap-4">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
