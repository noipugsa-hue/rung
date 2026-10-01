<template>
  <div class="min-h-screen flex flex-col">
    <Navbar />
    <main class="flex-1 pb-20 md:pb-0">
      <slot />
    </main>
    <Footer />
    <BottomNavigation />
  </div>
</template>
